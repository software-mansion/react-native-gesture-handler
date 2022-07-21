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

  onTouchEvent(event: GHEvent): boolean {
    this.isHandlingTouch = true;

    if (
      event.eventType === EventTypes.DOWN ||
      event.eventType === EventTypes.POINTER_DOWN
    ) {
      // this.extractGestureHandlers(event);
    } else if (event.eventType === EventTypes.CANCEL) {
      // this.cancellAll();
    }

    // this.deliverEventToGestureHandlers(event);

    this.isHandlingTouch = true;

    if (
      this.finishedHandlersCleanupScheduled &&
      this.handlingChangeSemaphore === 0
    ) {
      // this.cleanupFinishedHandlers();
    }

    return true;
  }

  private scheduleFinishedHandlersCleanup(): void {
    if (this.isHandlingTouch || this.handlingChangeSemaphore !== 0) {
      this.finishedHandlersCleanupScheduled = true;
    } else {
      // this.cleanupFinishedHandlers();
    }
  }

  private compactHandlersIf(
    handlers: GestureHandler[],
    count: number,
    predicate: (handler: GestureHandler) => boolean
  ): number {
    for (let i = 0; i < count; ++i) {
      if (predicate(handlers[i])) {
        handlers.splice(i, 1);
        --i;
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
      //
    }
  }

  //
  public onHandlerStateChange(
    handler: GestureHandler,
    newState: State,
    oldState: State,
    event: GHEvent
  ): void {
    // console.log(getKeyByValue(newState));
    // console.log(getKeyByValue(oldState));
    // console.log(event);
    handler.sendEvent(event, newState, oldState);
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
