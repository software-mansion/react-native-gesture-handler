import { State } from '../State';
import { EventTypes, GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';

export default class GestureHandlerOrchestrator {
  private static instance: GestureHandlerOrchestrator;

  private readonly DEFAULT_MIN_ALPHA = 0.1;

  private gestureHandlers: GestureHandler[] = [];
  private awaitingHandlers: GestureHandler[] = [];
  private preparedHandlers: GestureHandler[] = [];
  private handlersToCancel: GestureHandler[] = [];

  private isHandlingTouch = false;
  private handlingChangeSemaphore = 0;
  private finishedHandlersCleanupScheduled = false;
  private activationIndex = 0;

  // Private beacuse of Singleton
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  private scheduleFinishedHandlersCleanup(): void {
    if (this.isHandlingTouch || this.handlingChangeSemaphore !== 0) {
      this.finishedHandlersCleanupScheduled = true;
    } else {
      this.cleanupFinishedHandlers();
    }
  }

  private compactHandlersIf(
    handlers: GestureHandler[] | null[],
    predicate: (handler: GestureHandler | null) => boolean
  ): number {
    for (let i = 0; i < this.gestureHandlers.length; ++i) {
      if (predicate(handlers[i])) {
        handlers.splice(i, 1);
      }
    }

    return handlers.length;
  }

  private cleanupFinishedHandlers(): void {
    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];
      if (!handler) continue;

      if (this.isFinished(handler.getState()) && handler.isAwaiting()) {
        this.gestureHandlers.splice(i, 1);

        handler.reset();
        handler.setActive(false);
        handler.setAwaiting(false);
        handler.setActivationIndex(Number.MAX_VALUE);
      }
    }

    this.finishedHandlersCleanupScheduled = false;
  }

  private hasOtherHandlerToWaitFor(handler: GestureHandler): boolean {
    this.gestureHandlers.forEach((otherHandler) => {
      if (
        otherHandler &&
        !this.isFinished(otherHandler.getState()) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
      ) {
        return true;
      }
    });

    return false;
  }

  private tryActivate(handler: GestureHandler, event: GHEvent): void {
    if (this.hasOtherHandlerToWaitFor(handler)) {
      // this.addAwaitingHandler();
    } else {
      // this.makeActive(handler, event);
      handler.setAwaiting(false);
    }
  }

  private cleanupAwaitingHandlers(): void {
    this.compactHandlersIf(this.awaitingHandlers, (handler) =>
      handler!.isAwaiting()
    );
  }

  //
  public onHandlerStateChange(
    handler: GestureHandler,
    newState: State,
    oldState: State,
    event: GHEvent
  ): void {
    // console.log(oldState, newState, handler.id);
    // handler.sendEvent(event, newState, oldState);

    this.handlingChangeSemaphore += 1;

    if (this.isFinished(newState)) {
      this.awaitingHandlers.forEach((otherHandler) => {
        if (this.shouldHandlerWaitForOther(otherHandler!, handler)) {
          if (newState === State.END) {
            otherHandler?.cancel(event);
            otherHandler?.setAwaiting(false);
          } else {
            this.tryActivate(otherHandler!, event);
          }
        }
      });

      this.cleanupAwaitingHandlers();
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
  }

  private makeActive(handler: GestureHandler, event: GHEvent): void {
    handler.setAwaiting(false);
    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    // this.gestureHandlers.forEach((otherHandler) => {
    //   if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
    //     if (otherHandler) this.handlersToCancel.push(otherHandler);
    //   }
    // });

    for (let i = this.handlersToCancel.length - 1; i >= 0; --i) {
      this.handlersToCancel[i]?.cancel(event);
    }

    // this.awaitingHandlers.forEach((otherHandler) => {
    //   if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
    //     otherHandler?.cancel();
    //     otherHandler?.setAwaiting(true);
    //   }
    // });

    this.cleanupAwaitingHandlers();

    // handler.moveToState();
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

  isFinished(state: State): boolean {
    return (
      state === State.END || state === State.FAILED || state === State.CANCELLED
    );
  }

  public static getInstance() {
    if (!GestureHandlerOrchestrator.instance)
      GestureHandlerOrchestrator.instance = new GestureHandlerOrchestrator();

    return GestureHandlerOrchestrator.instance;
  }
}
