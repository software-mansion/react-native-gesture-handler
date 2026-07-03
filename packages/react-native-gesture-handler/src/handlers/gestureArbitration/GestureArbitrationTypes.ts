import type { State } from '../../State';

/**
 * Narrow, platform-neutral contract required by the arbitration core.
 */
export interface ArbitratedGestureHandler {
  readonly handlerTag: number;
  readonly state: State;
  readonly enabled: boolean | null;

  active: boolean;
  awaiting: boolean;
  activationIndex: number;
  shouldResetProgress: boolean;

  sendEvent(newState: State, oldState: State): void;
  cancel(): void;
  fail(): void;
  reset(): void;
}

/**
 * Relation decisions injected into the arbitration core.
 */
export interface GestureRelationPolicy<
  THandler extends ArbitratedGestureHandler,
> {
  /**
   * Whether `handler` has to wait for `otherHandler` to fail before it can
   * activate. Identity is already excluded by the core.
   */
  shouldHandlerWaitForOther(handler: THandler, otherHandler: THandler): boolean;

  /**
   * One-directional simultaneity check. The core treats handlers as
   * simultaneous when the check passes in either direction.
   */
  shouldRecognizeSimultaneously(
    handler: THandler,
    otherHandler: THandler
  ): boolean;

  /**
   * Whether an awaiting or active `handler` should be cancelled when
   * `otherHandler` activates.
   */
  shouldBeCancelledByOther(handler: THandler, otherHandler: THandler): boolean;

  /**
   * Platform-specific fallback used for handlers that are neither awaiting
   * nor active.
   */
  shouldBeCancelledByDefault(
    handler: THandler,
    otherHandler: THandler
  ): boolean;

  /**
   * Whether `handler` may begin given the already recorded handlers. On the
   * web this implements native-view cancellation rules.
   */
  shouldBeginWithRecordedHandlers(
    handler: THandler,
    recordedHandlers: readonly THandler[]
  ): boolean;
}
