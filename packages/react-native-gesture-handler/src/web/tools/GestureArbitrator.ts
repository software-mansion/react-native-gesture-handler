import { State } from '../../State';
import type IGestureHandler from '../handlers/IGestureHandler';

type HandlerConflictResolver = (
  handler: IGestureHandler,
  otherHandler: IGestureHandler
) => boolean;

/**
 * Platform-independent policy for deciding which handler state changes are
 * observable when several handlers participate in the same interaction.
 *
 * Platform-specific pointer overlap rules are supplied by the caller. This
 * keeps relation handling reusable by the web orchestrator and Jest runtime.
 */
export default class GestureArbitrator {
  private gestureHandlers: IGestureHandler[] = [];
  private awaitingHandlers: IGestureHandler[] = [];
  private awaitingHandlersTags: Set<number> = new Set();

  private handlingChangeSemaphore = 0;
  private activationIndex = 0;

  private readonly hasHandlerConflict: HandlerConflictResolver;

  public constructor(hasHandlerConflict: HandlerConflictResolver) {
    this.hasHandlerConflict = hasHandlerConflict;
  }

  private scheduleFinishedHandlersCleanup(): void {
    if (this.handlingChangeSemaphore === 0) {
      queueMicrotask(() => {
        this.cleanupFinishedHandlers();
      });
    }
  }

  private cleanHandler(handler: IGestureHandler): void {
    handler.reset();
    handler.active = false;
    handler.awaiting = false;
    handler.activationIndex = Number.MAX_VALUE;
  }

  public isHandlerRecorded(handler: IGestureHandler): boolean {
    return this.gestureHandlers.includes(handler);
  }

  public removeHandler(handler: IGestureHandler): void {
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

  public forEachHandler(callback: (handler: IGestureHandler) => void): void {
    this.gestureHandlers.forEach(callback);
  }

  private cleanupFinishedHandlers(): void {
    const handlersToRemove = new Set<IGestureHandler>();

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

  private hasOtherHandlerToWaitFor(handler: IGestureHandler): boolean {
    return this.gestureHandlers.some(
      (otherHandler) =>
        !this.isFinished(otherHandler.state) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
    );
  }

  private shouldBeCancelledByFinishedHandler(
    handler: IGestureHandler
  ): boolean {
    return this.gestureHandlers.some(
      (otherHandler) =>
        this.shouldHandlerWaitForOther(handler, otherHandler) &&
        otherHandler.state === State.END
    );
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

  private shouldActivate(handler: IGestureHandler): boolean {
    return !this.gestureHandlers.some((otherHandler) =>
      this.shouldHandlerBeCancelledBy(handler, otherHandler)
    );
  }

  private cleanupAwaitingHandlers(handler: IGestureHandler): void {
    for (const otherHandler of this.awaitingHandlers) {
      const shouldWait =
        !otherHandler.awaiting &&
        this.shouldHandlerWaitForOther(otherHandler, handler);

      if (shouldWait) {
        this.cleanHandler(otherHandler);
        this.awaitingHandlersTags.delete(otherHandler.handlerTag);
      }
    }

    this.awaitingHandlers = this.awaitingHandlers.filter((otherHandler) =>
      this.awaitingHandlersTags.has(otherHandler.handlerTag)
    );
  }

  public onHandlerStateChange(
    handler: IGestureHandler,
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

  private makeActive(handler: IGestureHandler): void {
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

  private addAwaitingHandler(handler: IGestureHandler): void {
    if (this.awaitingHandlers.includes(handler)) {
      return;
    }

    this.awaitingHandlers.push(handler);
    this.awaitingHandlersTags.add(handler.handlerTag);

    handler.awaiting = true;
    handler.activationIndex = this.activationIndex++;
  }

  public recordHandlerIfNotPresent(handler: IGestureHandler): void {
    if (this.isHandlerRecorded(handler)) {
      return;
    }

    handler.active = false;
    handler.awaiting = false;
    handler.activationIndex = Number.MAX_SAFE_INTEGER;

    if (!handler.shouldBeginWithRecordedHandlers(this.gestureHandlers)) {
      handler.cancel();
    }

    this.gestureHandlers.push(handler);
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
    firstHandler: IGestureHandler,
    secondHandler: IGestureHandler
  ): boolean {
    return (
      firstHandler === secondHandler ||
      firstHandler.shouldRecognizeSimultaneously(secondHandler) ||
      secondHandler.shouldRecognizeSimultaneously(firstHandler)
    );
  }

  private shouldHandlerBeCancelledBy(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    return (
      !this.canRunSimultaneously(handler, otherHandler) &&
      this.hasHandlerConflict(handler, otherHandler)
    );
  }

  private isFinished(state: State): boolean {
    return (
      state === State.END || state === State.FAILED || state === State.CANCELLED
    );
  }
}
