import { State } from '../../State';
import { GHEvent } from './EventManager';
import GestureHandler from '../handlers/GestureHandler';
import Tracker from './Tracker';

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
    if (this.handlingChangeSemaphore === 0) this.cleanupFinishedHandlers();
  }

  private cleanHandler(handler: GestureHandler): void {
    handler.reset();
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_VALUE);
  }

  private cleanupFinishedHandlers(): void {
    // console.log(this.gestureHandlers);
    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];
      if (!handler) continue;

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
  }

  //
  public onHandlerStateChange(
    handler: GestureHandler,
    newState: State,
    oldState: State,
    event: GHEvent
  ): void {
    this.handlingChangeSemaphore += 1;

    // console.log(handler.getId());

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

  private makeActive(handler: GestureHandler, event: GHEvent): void {
    const currentState = handler.getState();

    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    if (handler.getId().indexOf('native') < 0) {
      this.gestureHandlers.forEach((otherHandler) => {
        const res = this.shouldHandlerBeCancelledBy(otherHandler, handler);
        console.log(otherHandler.getTag(), handler.getTag(), res);

        //Order of arguments is correct - we check whether current handler should cancell existing handlers
        // if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        if (res) {
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
    }

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
    // console.log(gh1.getId(), gh2.getId());
    // console.log(gh1.shouldRecognizeSimultaneously(gh2));
    // console.log(gh2.shouldRecognizeSimultaneously(gh1));

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

    // console.log(handler.getTag(), otherHandler.getTag());

    console.log(handler.getTrackedPointersID());
    console.log(otherHandler.getTrackedPointersID());
    console.log(
      Tracker.shareCommonPointers(
        handler.getTrackedPointersID(),
        otherHandler.getTrackedPointersID()
      )
    );

    if (
      (handlerPointerHistory &&
        otherPointerHistory &&
        !Tracker.shareCommonPointers(
          handlerPointerHistory,
          otherPointerHistory
        )) ||
      !Tracker.shareCommonPointers(
        handler.getTrackedPointersID(),
        otherHandler.getTrackedPointersID()
      )
    ) {
      handler.clearPointerHistory();
      otherHandler.clearPointerHistory();

      return false;
    }

    console.log('std');

    if (this.canRunSimultaneously(handler, otherHandler)) {
      return false;
    }

    console.log('nd');

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
