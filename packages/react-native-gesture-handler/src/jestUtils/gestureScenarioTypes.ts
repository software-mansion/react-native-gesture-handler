import type { GestureType } from '../handlers/gestures/gesture';
import type { FlingGestureEvent } from '../v3/hooks/gestures/fling/FlingTypes';
import type { PanGestureActiveEvent } from '../v3/hooks/gestures/pan/PanTypes';
import type { PinchGestureActiveEvent } from '../v3/hooks/gestures/pinch/PinchTypes';
import type { AnySingleGesture } from '../v3/hooks/gestures/singleGestureUnion';
import type { TapGestureEvent } from '../v3/hooks/gestures/tap/TapTypes';
import type { SingleGestureName } from '../v3/types';

/**
 * Semantic outcome of a simulated interaction:
 * - `success` — the gesture begins, activates, dispatches updates and ends.
 * - `failed` — the gesture begins but fails before activation.
 * - `cancelled` — the gesture begins, activates, dispatches updates and is
 *   cancelled.
 */
export type GestureOutcome = 'success' | 'failed' | 'cancelled';

// Scenario payloads use the v3 callback event shape, never the native state
// machine envelope. `handlerTag` is filled in by the implementation.
type SemanticEventData<TEvent> = Partial<Omit<TEvent, 'handlerTag'>>;

// Per-stage payload overrides for a discrete gesture. On a real device each
// state change carries its own coordinate snapshot (e.g. a fling travels
// between touch-down and recognition), so tests may describe distinct data
// for each stage. Each stage is merged over `event`.
type DiscreteStageEvents<TEvent> = {
  /** Payload for `onBegin` (and `onFinalize` when the outcome is `failed`). */
  begin?: SemanticEventData<TEvent>;
  /** Payload for `onActivate`. */
  activate?: SemanticEventData<TEvent>;
  /** Payload for `onDeactivate` and `onFinalize`. */
  end?: SemanticEventData<TEvent>;
};

export type PanGestureScenario = {
  /** Payloads dispatched as `onUpdate` events while the gesture is active. */
  updates?: SemanticEventData<PanGestureActiveEvent>[];
  outcome?: GestureOutcome;
};

export type PinchGestureScenario = {
  /** Payloads dispatched as `onUpdate` events while the gesture is active. */
  updates?: SemanticEventData<PinchGestureActiveEvent>[];
  outcome?: GestureOutcome;
};

export type TapGestureScenario = {
  /** Payload used for every lifecycle callback of the tap. */
  event?: SemanticEventData<TapGestureEvent>;
  /** Per-stage payload overrides, merged over `event`. */
  stageEvents?: DiscreteStageEvents<TapGestureEvent>;
  outcome?: GestureOutcome;
};

export type FlingGestureScenario = {
  /** Payload used for every lifecycle callback of the fling. */
  event?: SemanticEventData<FlingGestureEvent>;
  /** Per-stage payload overrides, merged over `event`. */
  stageEvents?: DiscreteStageEvents<FlingGestureEvent>;
  outcome?: GestureOutcome;
};

export type ResolvedGestureTarget = GestureType | AnySingleGesture;
export type FireGestureTarget = string | ResolvedGestureTarget;

export type GestureScenario<TGesture extends ResolvedGestureTarget> =
  TGesture extends { type: SingleGestureName.Pan }
    ? PanGestureScenario
    : TGesture extends { type: SingleGestureName.Tap }
      ? TapGestureScenario
      : TGesture extends { type: SingleGestureName.Fling }
        ? FlingGestureScenario
        : TGesture extends { type: SingleGestureName.Pinch }
          ? PinchGestureScenario
          : never;

export type ScenarioForTarget<TTarget extends FireGestureTarget> =
  TTarget extends string
    ? GestureScenario<AnySingleGesture>
    : TTarget extends ResolvedGestureTarget
      ? GestureScenario<TTarget>
      : never;

// Equivalent of the built-in `NoInfer` (available since TypeScript 5.4).
// Kept local so the generated declarations do not force a newer TypeScript
// version onto consumers.
export type NoInferT<T> = [T][T extends unknown ? 0 : never];
