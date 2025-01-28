import { PointerType } from '../../PointerType';
import { State } from '../../State';

import type IGestureHandler from '../handlers/IGestureHandler';
import PointerTracker from './PointerTracker';

export default class GestureHandlerOrchestrator {
  private static instance: GestureHandlerOrchestrator;

  private gestureHandlers: IGestureHandler[] = [];
  private awaitingHandlers: IGestureHandler[] = [];
  private awaitingHandlersTags: Set<number> = new Set();

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

  private cleanHandler(handler: IGestureHandler): void {
    handler.reset();
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_VALUE);
  }

  public removeHandlerFromOrchestrator(handler: IGestureHandler): void {
    const indexInGestureHandlers = this.gestureHandlers.indexOf(handler);
    const indexInAwaitingHandlers = this.awaitingHandlers.indexOf(handler);

    if (indexInGestureHandlers >= 0) {
      this.gestureHandlers.splice(indexInGestureHandlers, 1);
    }

    if (indexInAwaitingHandlers >= 0) {
      this.awaitingHandlers.splice(indexInAwaitingHandlers, 1);
      this.awaitingHandlersTags.delete(handler.getTag());
    }
  }

  private cleanupFinishedHandlers(): void {
    const handlersToRemove = new Set<IGestureHandler>();

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];

      if (this.isFinished(handler.getState()) && !handler.isAwaiting()) {
        this.cleanHandler(handler);
        handlersToRemove.add(handler);
      }
    }

    this.gestureHandlers = this.gestureHandlers.filter(
      (handler) => !handlersToRemove.has(handler)
    );
  }

  private hasOtherHandlerToWaitFor(handler: IGestureHandler): boolean {
    const hasToWaitFor = (otherHandler: IGestureHandler) => {
      return (
        !this.isFinished(otherHandler.getState()) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
      );
    };

    return this.gestureHandlers.some(hasToWaitFor);
  }

  private shouldBeCancelledByFinishedHandler(
    handler: IGestureHandler
  ): boolean {
    const shouldBeCancelled = (otherHandler: IGestureHandler) => {
      return (
        this.shouldHandlerWaitForOther(handler, otherHandler) &&
        otherHandler.getState() === State.END
      );
    };

    return this.gestureHandlers.some(shouldBeCancelled);
  }

  private tryActivate(handler: IGestureHandler): void {
    if (this.shouldBeCancelledByFinishedHandler(handler)) {
      handler.cancel();
      return;
    }

    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler);
      return;
    }

    const handlerState = handler.getState();

    if (handlerState === State.CANCELLED || handlerState === State.FAILED) {
      return;
    }

    if (this.shouldActivate(handler)) {
      this.makeActive(handler);
      return;
    }

    if (handlerState === State.ACTIVE) {
      handler.fail();
      return;
    }

    if (handlerState === State.BEGAN) {
      handler.cancel();
    }
  }

  private shouldActivate(handler: IGestureHandler): boolean {
    const shouldBeCancelledBy = (otherHandler: IGestureHandler) => {
      return this.shouldHandlerBeCancelledBy(handler, otherHandler);
    };

    return !this.gestureHandlers.some(shouldBeCancelledBy);
  }

  private cleanupAwaitingHandlers(handler: IGestureHandler): void {
    const shouldWait = (otherHandler: IGestureHandler) => {
      return (
        !otherHandler.isAwaiting() &&
        this.shouldHandlerWaitForOther(otherHandler, handler)
      );
    };

    for (const otherHandler of this.awaitingHandlers) {
      if (shouldWait(otherHandler)) {
        this.cleanHandler(otherHandler);
        this.awaitingHandlersTags.delete(otherHandler.getTag());
      }
    }

    this.awaitingHandlers = this.awaitingHandlers.filter((otherHandler) =>
      this.awaitingHandlersTags.has(otherHandler.getTag())
    );
  }

  public onHandlerStateChange(
    handler: IGestureHandler,
    newState: State,
    oldState: State,
    sendIfDisabled?: boolean
  ): void {
    if (!handler.isEnabled() && !sendIfDisabled) {
      return;
    }

    this.handlingChangeSemaphore += 1;

    if (this.isFinished(newState)) {
      for (const otherHandler of this.awaitingHandlers) {
        if (
          !this.shouldHandlerWaitForOther(otherHandler, handler) ||
          !this.awaitingHandlersTags.has(otherHandler.getTag())
        ) {
          continue;
        }

        if (newState !== State.END) {
          this.tryActivate(otherHandler);
          continue;
        }

        otherHandler.cancel();

        if (otherHandler.getState() === State.END) {
          // Handle edge case, where discrete gestures end immediately after activation thus
          // their state is set to END and when the gesture they are waiting for activates they
          // should be cancelled, however `cancel` was never sent as gestures were already in the END state.
          // Send synthetic BEGAN -> CANCELLED to properly handle JS logic
          otherHandler.sendEvent(State.CANCELLED, State.BEGAN);
        }

        otherHandler.setAwaiting(false);
      }
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

    if (!this.awaitingHandlers.includes(handler)) {
      this.cleanupAwaitingHandlers(handler);
    }
  }

  private makeActive(handler: IGestureHandler): void {
    const currentState = handler.getState();

    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      if (this.shouldHandlerBeCancelledBy(this.gestureHandlers[i], handler)) {
        this.gestureHandlers[i].cancel();
      }
    }

    for (const otherHandler of this.awaitingHandlers) {
      if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        otherHandler.setAwaiting(false);
      }
    }

    handler.sendEvent(State.ACTIVE, State.BEGAN);

    if (currentState !== State.ACTIVE) {
      handler.sendEvent(State.END, State.ACTIVE);
      if (currentState !== State.END) {
        handler.sendEvent(State.UNDETERMINED, State.END);
      }
    }

    if (!handler.isAwaiting()) {
      return;
    }

    handler.setAwaiting(false);

    this.awaitingHandlers = this.awaitingHandlers.filter(
      (otherHandler) => otherHandler !== handler
    );
  }

  private addAwaitingHandler(handler: IGestureHandler): void {
    if (this.awaitingHandlers.includes(handler)) {
      return;
    }

    this.awaitingHandlers.push(handler);
    this.awaitingHandlersTags.add(handler.getTag());

    handler.setAwaiting(true);
    handler.setActivationIndex(this.activationIndex++);
  }

  public recordHandlerIfNotPresent(handler: IGestureHandler): void {
    if (this.gestureHandlers.includes(handler)) {
      return;
    }

    this.gestureHandlers.push(handler);

    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_SAFE_INTEGER);
  }

  private shouldHandlerWaitForOther(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    return (
      handler !== otherHandler &&
      (handler.shouldWaitForHandlerFailure(otherHandler) ||
        otherHandler.shouldRequireToWaitForFailure(handler))
    );
  }

  private canRunSimultaneously(
    gh1: IGestureHandler,
    gh2: IGestureHandler
  ): boolean {
    return (
      gh1 === gh2 ||
      gh1.shouldRecognizeSimultaneously(gh2) ||
      gh2.shouldRecognizeSimultaneously(gh1)
    );
  }

  private shouldHandlerBeCancelledBy(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    if (this.canRunSimultaneously(handler, otherHandler)) {
      return false;
    }

    if (handler.isAwaiting() || handler.getState() === State.ACTIVE) {
      // For now it always returns false
      return handler.shouldBeCancelledByOther(otherHandler);
    }

    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();

    if (
      !PointerTracker.shareCommonPointers(handlerPointers, otherPointers) &&
      handler.getDelegate().getView() !== otherHandler.getDelegate().getView()
    ) {
      return this.checkOverlap(handler, otherHandler);
    }

    return true;
  }

  private checkOverlap(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    // If handlers don't have common pointers, default return value is false.
    // However, if at least on pointer overlaps with both handlers, we return true
    // This solves issue in overlapping parents example

    // TODO: Find better way to handle that issue, for example by activation order and handler cancelling

    const isPointerWithinBothBounds = (pointer: number) => {
      const point = handler.getTracker().getLastAbsoluteCoords(pointer);

      return (
        handler.getDelegate().isPointerInBounds(point) &&
        otherHandler.getDelegate().isPointerInBounds(point)
      );
    };

    return handler.getTrackedPointersID().some(isPointerWithinBothBounds);
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
  public cancelMouseAndPenGestures(currentHandler: IGestureHandler): void {
    this.gestureHandlers.forEach((handler: IGestureHandler) => {
      if (
        handler.getPointerType() !== PointerType.MOUSE &&
        handler.getPointerType() !== PointerType.STYLUS
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
