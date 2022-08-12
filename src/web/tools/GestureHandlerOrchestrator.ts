import { State } from '../../State';
import { AdaptedPointerEvent } from '../interfaces';

import GestureHandler from '../handlers/GestureHandler';
import PointerTracker from './PointerTracker';

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

  private tryActivate(
    handler: GestureHandler,
    event: AdaptedPointerEvent
  ): void {
    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler);
    } else {
      this.makeActive(handler, event);
    }
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
    event: AdaptedPointerEvent
  ): void {
    this.handlingChangeSemaphore += 1;

    if (this.isFinished(newState)) {
      this.awaitingHandlers.forEach((otherHandler) => {
        if (this.shouldHandlerWaitForOther(otherHandler, handler)) {
          if (newState === State.END) {
            otherHandler?.cancel(event);
            otherHandler?.setAwaiting(false);
          } else {
            this.tryActivate(otherHandler, event);
          }
        }
      });
    }

    if (newState === State.ACTIVE) {
      this.tryActivate(handler, event);
    } else if (oldState === State.ACTIVE || oldState === State.END) {
      if (handler.isActive()) {
        handler.sendEvent(event, newState, oldState);
      } else if (oldState === State.ACTIVE) {
        handler.sendEvent(event, newState, State.BEGAN);
      }
    } else if (
      oldState !== State.UNDETERMINED ||
      newState !== State.CANCELLED
    ) {
      handler.sendEvent(event, newState, oldState);
    }

    this.handlingChangeSemaphore -= 1;

    this.scheduleFinishedHandlersCleanup();

    if (this.awaitingHandlers.indexOf(handler) < 0) {
      this.cleanupAwaitingHandlers(handler);
    }
  }

  private makeActive(
    handler: GestureHandler,
    event: AdaptedPointerEvent
  ): void {
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
      this.handlersToCancel[i]?.cancel(event);
    }
    this.awaitingHandlers.forEach((otherHandler) => {
      if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        otherHandler?.cancel(event);
        otherHandler?.setAwaiting(true);
      }
    });

    handler.sendEvent(event, State.ACTIVE, State.BEGAN);

    if (currentState !== State.ACTIVE) {
      handler.sendEvent(event, State.END, State.ACTIVE);
      if (currentState !== State.END) {
        handler.sendEvent(event, State.UNDETERMINED, State.END);
      }
    }

    if (handler.isAwaiting()) {
      handler.setAwaiting(false);
      handler.end(event);
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
    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();

    if (
      !PointerTracker.shareCommonPointers(handlerPointers, otherPointers) &&
      handler.getView() !== otherHandler.getView()
    ) {
      return this.checkOverlap(handler, otherHandler);
    }

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
        handler
          .getEventManager()
          .isPointerInBounds({ x: handlerX, y: handlerY }) &&
        otherHandler
          .getEventManager()
          .isPointerInBounds({ x: handlerX, y: handlerY })
      ) {
        overlap = true;
      }
    });

    otherPointers.forEach((pointer: number) => {
      const otherX: number = otherHandler.getTracker().getLastX(pointer);
      const otherY: number = otherHandler.getTracker().getLastY(pointer);

      if (
        handler.getEventManager().isPointerInBounds({ x: otherX, y: otherY }) &&
        otherHandler
          .getEventManager()
          .isPointerInBounds({ x: otherX, y: otherY })
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

  public static getInstance(): GestureHandlerOrchestrator {
    if (!GestureHandlerOrchestrator.instance)
      GestureHandlerOrchestrator.instance = new GestureHandlerOrchestrator();

    return GestureHandlerOrchestrator.instance;
  }
}
