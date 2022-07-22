import { State } from '../State';
import { EventTypes, GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';

export default class GestureHandlerOrchestrator {
  private static instance: GestureHandlerOrchestrator;

  private readonly DEFAULT_MIN_ALPHA = 0.1;

  private gestureHandlers: GestureHandler[] | null[] = [];
  private awaitingHandlers: GestureHandler[] | null[] = [];
  private preparedHandlers: GestureHandler[] | null[] = [];
  private handlersToCancel: GestureHandler[] | null[] = [];

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
      // this.cleanupFinishedHandlers();
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
    let shouldCleanEmptyCells = false;

    if (!this.gestureHandlers) return;

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];
      if (!handler) continue;

      if (this.isFinished(handler.getState()) && handler.isAwaiting()) {
        this.gestureHandlers[i] = null;
        shouldCleanEmptyCells = true;

        handler.reset();
        handler.setActive(false);
        handler.setAwaiting(false);
        handler.setActivationIndex(Number.MAX_VALUE);
      }
    }

    if (shouldCleanEmptyCells) {
      this.compactHandlersIf(
        this.gestureHandlers,
        (handler) => handler !== null
      );
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

  private tryActivate(handler: GestureHandler): void {
    if (this.hasOtherHandlerToWaitFor(handler)) {
      // this.addAwaitingHandler();
    } else {
      // this.makeActive(handler);
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
    handler.sendEvent(event, newState, oldState);
  }

  private makeActive(handler: GestureHandler): void {
    handler.setAwaiting(false);
    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    // this.gestureHandlers.forEach((otherHandler) => {
    //   if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
    //     this.handlersToCancel.push(otherHandler);
    //   }
    // });

    for (let i = this.handlersToCancel.length - 1; i >= 0; --i) {
      this.handlersToCancel[i]?.cancel();
    }
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
