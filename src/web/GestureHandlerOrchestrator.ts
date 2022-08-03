import { NativeViewGestureHandler } from '../handlers/NativeViewGestureHandler';
import { State } from '../State';
import { GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';
import Tracker from './Tracker';

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

  private cleanHandler(handler: GestureHandler): void {
    handler.reset();
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_VALUE);
  }

  private cleanupFinishedHandlers(): void {
    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];
      if (!handler) continue;

      if (this.isFinished(handler.getState()) && handler.isAwaiting()) {
        this.gestureHandlers.splice(i, 1);

        this.cleanHandler(handler);
      }
    }

    this.finishedHandlersCleanupScheduled = false;
  }

  private hasOtherHandlerToWaitFor(handler: GestureHandler): boolean {
    let ans = false;
    this.gestureHandlers.forEach((otherHandler) => {
      if (
        otherHandler &&
        !this.isFinished(otherHandler.getState()) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
      ) {
        ans = true;
        return;
      }
    });

    return ans;
  }

  private tryActivate(handler: GestureHandler, event: GHEvent): void {
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
    // this.awaitingHandlers = [];
  }

  //
  public onHandlerStateChange(
    handler: GestureHandler,
    newState: State,
    oldState: State,
    event: GHEvent
  ): void {
    this.handlingChangeSemaphore += 1;

    // console.log(this.gestureHandlers);

    // console.log(handler.getId(), `${oldState} -> ${newState}`);
    // console.log(this.awaitingHandlers);

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

      // this.cleanupAwaitingHandlers(handler);
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

  private makeActive(handler: GestureHandler, event: GHEvent): void {
    const currentState = handler.getState();

    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    // console.log(handler.id.indexOf('native'));
    if (handler.getId().indexOf('native') < 0) {
      this.gestureHandlers.forEach((otherHandler) => {
        if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
          this.handlersToCancel.push(otherHandler);
          // console.log(this.handlersToCancel, otherHandler.id);
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
    }

    // this.cleanupAwaitingHandlers();

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

  private cancellAll(event: GHEvent): void {
    for (let i = this.awaitingHandlers.length - 1; i >= 0; --i) {
      this.awaitingHandlers[i].cancel(event);
    }

    this.gestureHandlers.forEach((handler) => {
      this.preparedHandlers.push(handler);
    });

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      this.preparedHandlers[i].cancel(event);
    }
  }

  private addAwaitingHandler(handler: GestureHandler) {
    let alreadyExists = false;
    this.awaitingHandlers.forEach((otherHandler) => {
      if (otherHandler === handler) {
        alreadyExists = true;
        return;
      }
    });

    if (alreadyExists) return;

    this.awaitingHandlers.push(handler);

    handler.setAwaiting(true);
    handler.setActivationIndex(this.activationIndex++);
  }

  public recordHandlerIfNotPresent(handler: GestureHandler) {
    let alreadyExists = false;
    this.gestureHandlers.forEach((otherHandler) => {
      if (otherHandler === handler) {
        alreadyExists = true;
        return;
      }
    });

    if (alreadyExists) return;

    this.gestureHandlers.push(handler);

    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_SAFE_INTEGER);
  }

  //
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
    const handlerPointerHistory: number[] | null = handler.getPointersHistory();
    const otherPointerHistory:
      | number[]
      | null = otherHandler.getPointersHistory();

    if (
      handlerPointerHistory &&
      otherPointerHistory &&
      !Tracker.shareCommonPointers(handlerPointerHistory, otherPointerHistory)
    ) {
      handler.clearPointerHistory();
      otherHandler.clearPointerHistory();
      return false;
    }
    // if (
    //   !Tracker.shareCommonPointers(
    //     handler.getTrackedPointers(),
    //     otherHandler.getTrackedPointers()
    //   )
    // ) {
    //   console.log(
    //     handler.getTrackedPointers(),
    //     otherHandler.getTrackedPointers()
    //   );
    //   console.log('st');
    //   return false;
    // }

    ///
    if (this.canRunSimultaneously(handler, otherHandler)) {
      return false;
    }

    if (
      handler !== otherHandler &&
      (handler.isAwaiting() || handler.getState() === State.ACTIVE)
    ) {
      return handler.shouldBeCancelledByOther(otherHandler);
    }
    return true;
  }

  private isFinished(state: State): boolean {
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
