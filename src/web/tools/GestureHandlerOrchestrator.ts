import { State } from '../../State';
import { PointerType } from '../interfaces';

import GestureHandler from '../handlers/GestureHandler';
import PointerTracker from './PointerTracker';
import { isPointerInBounds } from '../utils';

export default class GestureHandlerOrchestrator {
  private static instance: GestureHandlerOrchestrator;

  private gestureHandlers: GestureHandler[] = [];
  private awaitingHandlers: GestureHandler[] = [];
  private handlersToCancel: GestureHandler[] = [];

  private handlingChangeSemaphore = 0;
  private activationIndex = 0;

  // Private beacuse of Singleton
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  private scheduleFinishedHandlersCleanup(): void {
    if (this.handlingChangeSemaphore === 0) {
      this.cleanupFinishedHandlers();
    }
  }

  private cleanHandler(handler: GestureHandler): void {
    handler.reset();
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_VALUE);
  }

  public removeHandlerFromOrchestrator(handler: GestureHandler): void {
    this.gestureHandlers.splice(this.gestureHandlers.indexOf(handler), 1);
    this.awaitingHandlers.splice(this.awaitingHandlers.indexOf(handler), 1);
    this.handlersToCancel.splice(this.handlersToCancel.indexOf(handler), 1);
  }

  private cleanupFinishedHandlers(): void {
    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];

      if (!handler) {
        continue;
      }
      if (this.isFinished(handler.getState()) && !handler.isAwaiting()) {
        this.gestureHandlers.splice(i, 1);

        this.cleanHandler(handler);
      }
    }
  }

  private hasOtherHandlerToWaitFor(handler: GestureHandler): boolean {
    let hasToWait = false;
    this.gestureHandlers.forEach((otherHandler) => {
      if (
        otherHandler &&
        !this.isFinished(otherHandler.getState()) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
      ) {
        hasToWait = true;
        return;
      }
    });

    return hasToWait;
  }

  private tryActivate(handler: GestureHandler): void {
    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler);
    } else if (
      handler.getState() !== State.CANCELLED &&
      handler.getState() !== State.FAILED
    ) {
      if (this.shouldActivate(handler)) {
        this.makeActive(handler);
      } else {
        switch (handler.getState()) {
          case State.ACTIVE:
            handler.fail();
            break;
          case State.BEGAN:
            handler.cancel();
        }
      }
    }
  }

  private shouldActivate(handler: GestureHandler): boolean {
    for (const otherHandler of this.gestureHandlers) {
      if (this.shouldHandlerBeCancelledBy(handler, otherHandler)) {
        return false;
      }
    }

    return true;
  }

  private cleanupAwaitingHandlers(handler: GestureHandler): void {
    for (let i = 0; i < this.awaitingHandlers.length; ++i) {
      if (
        !this.awaitingHandlers[i].isAwaiting() &&
        this.shouldHandlerWaitForOther(this.awaitingHandlers[i], handler)
      ) {
        this.cleanHandler(this.awaitingHandlers[i]);
        this.awaitingHandlers.splice(i, 1);
      }
    }
  }

  public onHandlerStateChange(
    handler: GestureHandler,
    newState: State,
    oldState: State,
    sendIfDisabled?: boolean
  ): void {
    if (!handler.isEnabled() && !sendIfDisabled) {
      return;
    }

    this.handlingChangeSemaphore += 1;

    if (this.isFinished(newState)) {
      this.awaitingHandlers.forEach((otherHandler) => {
        if (this.shouldHandlerWaitForOther(otherHandler, handler)) {
          if (newState === State.END) {
            otherHandler?.cancel();
            if (otherHandler.getState() === State.END) {
              // Handle edge case, where discrete gestures end immediately after activation thus
              // their state is set to END and when the gesture they are waiting for activates they
              // should be cancelled, however `cancel` was never sent as gestures were already in the END state.
              // Send synthetic BEGAN -> CANCELLED to properly handle JS logic
              otherHandler.sendEvent(State.CANCELLED, State.BEGAN);
            }
            otherHandler?.setAwaiting(false);
          } else {
            this.tryActivate(otherHandler);
          }
        }
      });
    }

    if (newState === State.ACTIVE) {
      this.tryActivate(handler);
    } else if (oldState === State.ACTIVE || oldState === State.END) {
      if (handler.isActive()) {
        handler.sendEvent(newState, oldState);
      } else if (
        oldState === State.ACTIVE &&
        (newState === State.CANCELLED || newState === State.FAILED)
      ) {
        handler.sendEvent(newState, State.BEGAN);
      }
    } else if (
      oldState !== State.UNDETERMINED ||
      newState !== State.CANCELLED
    ) {
      handler.sendEvent(newState, oldState);
    }

    this.handlingChangeSemaphore -= 1;

    this.scheduleFinishedHandlersCleanup();

    if (this.awaitingHandlers.indexOf(handler) < 0) {
      this.cleanupAwaitingHandlers(handler);
    }
  }

  private makeActive(handler: GestureHandler): void {
    const currentState = handler.getState();

    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    this.gestureHandlers.forEach((otherHandler) => {
      // Order of arguments is correct - we check whether current handler should cancel existing handlers

      if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        this.handlersToCancel.push(otherHandler);
      }
    });

    for (let i = this.handlersToCancel.length - 1; i >= 0; --i) {
      this.handlersToCancel[i]?.cancel();
    }
    this.awaitingHandlers.forEach((otherHandler) => {
      if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        otherHandler?.cancel();
        otherHandler?.setAwaiting(true);
      }
    });

    handler.sendEvent(State.ACTIVE, State.BEGAN);

    if (currentState !== State.ACTIVE) {
      handler.sendEvent(State.END, State.ACTIVE);
      if (currentState !== State.END) {
        handler.sendEvent(State.UNDETERMINED, State.END);
      }
    }

    if (handler.isAwaiting()) {
      handler.setAwaiting(false);
      for (let i = 0; i < this.awaitingHandlers.length; ++i) {
        if (this.awaitingHandlers[i] === handler) {
          this.awaitingHandlers.splice(i, 1);
        }
      }
    }

    this.handlersToCancel = [];
  }

  private addAwaitingHandler(handler: GestureHandler): void {
    let alreadyExists = false;

    this.awaitingHandlers.forEach((otherHandler) => {
      if (otherHandler === handler) {
        alreadyExists = true;
        return;
      }
    });

    if (alreadyExists) {
      return;
    }

    this.awaitingHandlers.push(handler);

    handler.setAwaiting(true);
    handler.setActivationIndex(this.activationIndex++);
  }

  public recordHandlerIfNotPresent(handler: GestureHandler): void {
    let alreadyExists = false;

    this.gestureHandlers.forEach((otherHandler) => {
      if (otherHandler === handler) {
        alreadyExists = true;
        return;
      }
    });

    if (alreadyExists) {
      return;
    }

    this.gestureHandlers.push(handler);

    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_SAFE_INTEGER);
  }

  private shouldHandlerWaitForOther(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    return (
      handler !== otherHandler &&
      (handler.shouldWaitForHandlerFailure(otherHandler) ||
        otherHandler.shouldRequireToWaitForFailure(handler))
    );
  }

  private canRunSimultaneously(
    gh1: GestureHandler,
    gh2: GestureHandler
  ): boolean {
    return (
      gh1 === gh2 ||
      gh1.shouldRecognizeSimultaneously(gh2) ||
      gh2.shouldRecognizeSimultaneously(gh1)
    );
  }

  private shouldHandlerBeCancelledBy(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    if (this.canRunSimultaneously(handler, otherHandler)) {
      return false;
    }

    if (
      handler !== otherHandler &&
      (handler.isAwaiting() || handler.getState() === State.ACTIVE)
    ) {
      // For now it always returns false
      return handler.shouldBeCancelledByOther(otherHandler);
    }

    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();

    if (
      !PointerTracker.shareCommonPointers(handlerPointers, otherPointers) &&
      handler.getView() !== otherHandler.getView()
    ) {
      return this.checkOverlap(handler, otherHandler);
    }

    return true;
  }

  private checkOverlap(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    // If handlers don't have common pointers, default return value is false.
    // However, if at least on pointer overlaps with both handlers, we return true
    // This solves issue in overlapping parents example

    // TODO: Find better way to handle that issue, for example by activation order and handler cancelling

    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();

    let overlap = false;

    handlerPointers.forEach((pointer: number) => {
      const handlerX: number = handler.getTracker().getLastX(pointer);
      const handlerY: number = handler.getTracker().getLastY(pointer);

      if (
        isPointerInBounds(handler.getView(), { x: handlerX, y: handlerY }) &&
        isPointerInBounds(otherHandler.getView(), { x: handlerX, y: handlerY })
      ) {
        overlap = true;
      }
    });

    otherPointers.forEach((pointer: number) => {
      const otherX: number = otherHandler.getTracker().getLastX(pointer);
      const otherY: number = otherHandler.getTracker().getLastY(pointer);

      if (
        isPointerInBounds(handler.getView(), { x: otherX, y: otherY }) &&
        isPointerInBounds(otherHandler.getView(), { x: otherX, y: otherY })
      ) {
        overlap = true;
      }
    });

    return overlap;
  }

  private isFinished(state: State): boolean {
    return (
      state === State.END || state === State.FAILED || state === State.CANCELLED
    );
  }

  // This function is called when handler receives touchdown event
  // If handler is using mouse or pen as a pointer and any handler receives touch event,
  // mouse/pen event dissappears - it doesn't send onPointerCancel nor onPointerUp (and others)
  // This became a problem because handler was left at active state without any signal to end or fail
  // To handle this, when new touch event is received, we loop through active handlers and check which type of
  // pointer they're using. If there are any handler with mouse/pen as a pointer, we cancel them
  public cancelMouseAndPenGestures(currentHandler: GestureHandler): void {
    this.gestureHandlers.forEach((handler: GestureHandler) => {
      if (
        handler.getPointerType() !== PointerType.MOUSE &&
        handler.getPointerType() !== PointerType.PEN
      ) {
        return;
      }

      if (handler !== currentHandler) {
        handler.cancel();
      } else {
        // Handler that received touch event should have its pointer tracker reset
        // This allows handler to smoothly change from mouse/pen to touch
        // The drawback is, that when we try to use mouse/pen one more time, it doesn't send onPointerDown at the first time
        // so it is required to click two times to get handler to work
        //
        // However, handler will receive manually created onPointerEnter that is triggered in EventManager in onPointerMove method.
        // There may be possibility to use that fact to make handler respond properly to first mouse click
        handler.getTracker().resetTracker();
      }
    });
  }

  public static getInstance(): GestureHandlerOrchestrator {
    if (!GestureHandlerOrchestrator.instance) {
      GestureHandlerOrchestrator.instance = new GestureHandlerOrchestrator();
    }

    return GestureHandlerOrchestrator.instance;
  }
}
