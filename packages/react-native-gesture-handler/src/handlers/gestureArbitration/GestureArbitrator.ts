import { State } from '../../State';
import type {
  ArbitratedGestureHandler,
  GestureRelationPolicy,
} from './GestureArbitrationTypes';

/**
 * Platform-neutral gesture state arbitration core.
 * It records participating handlers, tracks
 * active and awaiting handlers, defers activation while dependencies are
 * unresolved, applies relation decisions supplied by the injected policy and
 * emits only observable state transitions.
 */
export default class GestureArbitrator<
  THandler extends ArbitratedGestureHandler,
> {
  private gestureHandlers: THandler[] = [];
  private awaitingHandlers: THandler[] = [];
  private awaitingHandlersTags: Set<number> = new Set();

  private handlingChangeSemaphore = 0;
  private activationIndex = 0;

  // eslint-disable-next-line no-useless-constructor
  constructor(private relationPolicy: GestureRelationPolicy<THandler>) {}

  public get recordedHandlers(): readonly THandler[] {
    return this.gestureHandlers;
  }

  private scheduleFinishedHandlersCleanup(): void {
    if (this.handlingChangeSemaphore === 0) {
      queueMicrotask(() => {
        this.cleanupFinishedHandlers();
      });
    }
  }

  private cleanHandler(handler: THandler): void {
    handler.reset();
    handler.active = false;
    handler.awaiting = false;
    handler.activationIndex = Number.MAX_VALUE;
  }

  public isHandlerRecorded(handler: THandler): boolean {
    return this.gestureHandlers.includes(handler);
  }

  public removeHandler(handler: THandler): void {
    const indexInGestureHandlers = this.gestureHandlers.indexOf(handler);
    const indexInAwaitingHandlers = this.awaitingHandlers.indexOf(handler);

    if (indexInGestureHandlers >= 0) {
      this.gestureHandlers.splice(indexInGestureHandlers, 1);
    }

    if (indexInAwaitingHandlers >= 0) {
      this.awaitingHandlers.splice(indexInAwaitingHandlers, 1);
      this.awaitingHandlersTags.delete(handler.handlerTag);
    }
  }

  private cleanupFinishedHandlers(): void {
    const handlersToRemove = new Set<THandler>();

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];

      if (this.isFinished(handler.state) && !handler.awaiting) {
        this.cleanHandler(handler);
        handlersToRemove.add(handler);
      }
    }

    this.gestureHandlers = this.gestureHandlers.filter(
      (handler) => !handlersToRemove.has(handler)
    );
  }

  private hasOtherHandlerToWaitFor(handler: THandler): boolean {
    const hasToWaitFor = (otherHandler: THandler) => {
      return (
        !this.isFinished(otherHandler.state) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
      );
    };

    return this.gestureHandlers.some(hasToWaitFor);
  }

  private shouldBeCancelledByFinishedHandler(handler: THandler): boolean {
    const shouldBeCancelled = (otherHandler: THandler) => {
      return (
        this.shouldHandlerWaitForOther(handler, otherHandler) &&
        otherHandler.state === State.END
      );
    };

    return this.gestureHandlers.some(shouldBeCancelled);
  }

  private tryActivate(handler: THandler): void {
    if (this.shouldBeCancelledByFinishedHandler(handler)) {
      handler.cancel();
      return;
    }

    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler);
      return;
    }

    const handlerState = handler.state;

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

  private shouldActivate(handler: THandler): boolean {
    const shouldBeCancelledBy = (otherHandler: THandler) => {
      return this.shouldHandlerBeCancelledBy(handler, otherHandler);
    };

    return !this.gestureHandlers.some(shouldBeCancelledBy);
  }

  private cleanupAwaitingHandlers(handler: THandler): void {
    const shouldWait = (otherHandler: THandler) => {
      return (
        !otherHandler.awaiting &&
        this.shouldHandlerWaitForOther(otherHandler, handler)
      );
    };

    for (const otherHandler of this.awaitingHandlers) {
      if (shouldWait(otherHandler)) {
        this.cleanHandler(otherHandler);
        this.awaitingHandlersTags.delete(otherHandler.handlerTag);
      }
    }

    this.awaitingHandlers = this.awaitingHandlers.filter((otherHandler) =>
      this.awaitingHandlersTags.has(otherHandler.handlerTag)
    );
  }

  public onHandlerStateChange(
    handler: THandler,
    newState: State,
    oldState: State,
    sendIfDisabled?: boolean
  ): void {
    if (!handler.enabled && !sendIfDisabled) {
      return;
    }

    this.handlingChangeSemaphore += 1;

    if (this.isFinished(newState)) {
      for (const otherHandler of this.awaitingHandlers) {
        if (
          !this.shouldHandlerWaitForOther(otherHandler, handler) ||
          !this.awaitingHandlersTags.has(otherHandler.handlerTag)
        ) {
          continue;
        }

        if (newState !== State.END) {
          this.tryActivate(otherHandler);
          continue;
        }

        otherHandler.cancel();

        if (otherHandler.state === State.END) {
          // Handle edge case, where discrete gestures end immediately after activation thus
          // their state is set to END and when the gesture they are waiting for activates they
          // should be cancelled, however `cancel` was never sent as gestures were already in the END state.
          // Send synthetic BEGAN -> CANCELLED to properly handle JS logic
          otherHandler.sendEvent(State.CANCELLED, State.BEGAN);
        }

        otherHandler.awaiting = false;
      }
    }

    if (newState === State.ACTIVE) {
      this.tryActivate(handler);
    } else if (oldState === State.ACTIVE || oldState === State.END) {
      if (handler.active) {
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

  private makeActive(handler: THandler): void {
    const currentState = handler.state;

    handler.active = true;
    handler.shouldResetProgress = true;
    handler.activationIndex = this.activationIndex++;

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      if (this.shouldHandlerBeCancelledBy(this.gestureHandlers[i], handler)) {
        this.gestureHandlers[i].cancel();
      }
    }

    for (const otherHandler of this.awaitingHandlers) {
      if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        otherHandler.awaiting = false;
      }
    }

    handler.sendEvent(State.ACTIVE, State.BEGAN);

    if (currentState !== State.ACTIVE) {
      handler.sendEvent(State.END, State.ACTIVE);
      if (currentState !== State.END) {
        handler.sendEvent(State.UNDETERMINED, State.END);
      }
    }

    if (!handler.awaiting) {
      return;
    }

    handler.awaiting = false;

    this.awaitingHandlers = this.awaitingHandlers.filter(
      (otherHandler) => otherHandler !== handler
    );
  }

  private addAwaitingHandler(handler: THandler): void {
    if (this.awaitingHandlers.includes(handler)) {
      return;
    }

    this.awaitingHandlers.push(handler);
    this.awaitingHandlersTags.add(handler.handlerTag);

    handler.awaiting = true;
    handler.activationIndex = this.activationIndex++;
  }

  public recordHandlerIfNotPresent(handler: THandler): void {
    if (this.isHandlerRecorded(handler)) {
      return;
    }

    handler.active = false;
    handler.awaiting = false;
    handler.activationIndex = Number.MAX_SAFE_INTEGER;

    if (
      !this.relationPolicy.shouldBeginWithRecordedHandlers(
        handler,
        this.gestureHandlers
      )
    ) {
      handler.cancel();
    }

    this.gestureHandlers.push(handler);
  }

  private shouldHandlerWaitForOther(
    handler: THandler,
    otherHandler: THandler
  ): boolean {
    return (
      handler !== otherHandler &&
      this.relationPolicy.shouldHandlerWaitForOther(handler, otherHandler)
    );
  }

  private canRunSimultaneously(gh1: THandler, gh2: THandler): boolean {
    return (
      gh1 === gh2 ||
      this.relationPolicy.shouldRecognizeSimultaneously(gh1, gh2) ||
      this.relationPolicy.shouldRecognizeSimultaneously(gh2, gh1)
    );
  }

  private shouldHandlerBeCancelledBy(
    handler: THandler,
    otherHandler: THandler
  ): boolean {
    if (this.canRunSimultaneously(handler, otherHandler)) {
      return false;
    }

    if (handler.awaiting || handler.state === State.ACTIVE) {
      return this.relationPolicy.shouldBeCancelledByOther(
        handler,
        otherHandler
      );
    }

    return this.relationPolicy.shouldBeCancelledByDefault(
      handler,
      otherHandler
    );
  }

  private isFinished(state: State): boolean {
    return (
      state === State.END || state === State.FAILED || state === State.CANCELLED
    );
  }

  /**
   * Clears all recorded and awaiting handlers. Used by the Jest utilities to
   * keep tests isolated; the web orchestrator does not use it.
   */
  public reset(): void {
    this.gestureHandlers = [];
    this.awaitingHandlers = [];
    this.awaitingHandlersTags.clear();
    this.handlingChangeSemaphore = 0;
    this.activationIndex = 0;
  }
}
