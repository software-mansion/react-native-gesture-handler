/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  HoverGestureConfig,
  HoverGestureDeactivateEvent,
  HoverGestureFinalizeEvent,
  PanGestureActiveEvent,
  PanGestureBeginEvent,
  PanGestureConfig,
  PanGestureDeactivateEvent,
  PanGestureEvent,
  PanGestureFinalizeEvent,
  TapGestureActiveEvent,
  TapGestureBeginEvent,
  TapGestureConfig,
  TapGestureDeactivateEvent,
  TapGestureFinalizeEvent,
} from '../src/v3';

type StaticAssert<T extends true> = T;
type Same<A, B> = A extends B ? (B extends A ? true : false) : false;
type EventOf<TConfig, TKey extends keyof TConfig> = Parameters<
  NonNullable<Extract<TConfig[TKey], (...args: never[]) => void>>
>[0];

// The exported event aliases must match the callback parameter types exactly,
// both for a gesture with extended data (Pan) and one without (Tap).
type PanBegin = StaticAssert<
  Same<PanGestureBeginEvent, EventOf<PanGestureConfig, 'onBegin'>>
>;
type PanActive = StaticAssert<
  Same<PanGestureActiveEvent, EventOf<PanGestureConfig, 'onActivate'>>
>;
type PanDeactivate = StaticAssert<
  Same<PanGestureDeactivateEvent, EventOf<PanGestureConfig, 'onDeactivate'>>
>;
type PanFinalize = StaticAssert<
  Same<PanGestureFinalizeEvent, EventOf<PanGestureConfig, 'onFinalize'>>
>;
type PanDeprecated = StaticAssert<Same<PanGestureEvent, PanGestureBeginEvent>>;

type TapBegin = StaticAssert<
  Same<TapGestureBeginEvent, EventOf<TapGestureConfig, 'onBegin'>>
>;
type TapActive = StaticAssert<
  Same<TapGestureActiveEvent, EventOf<TapGestureConfig, 'onActivate'>>
>;
type TapDeactivate = StaticAssert<
  Same<TapGestureDeactivateEvent, EventOf<TapGestureConfig, 'onDeactivate'>>
>;
type TapFinalize = StaticAssert<
  Same<TapGestureFinalizeEvent, EventOf<TapGestureConfig, 'onFinalize'>>
>;

// Deactivate carries the extended data, Finalize only the base data.
type HoverDeactivate = StaticAssert<
  Same<HoverGestureDeactivateEvent, EventOf<HoverGestureConfig, 'onDeactivate'>>
>;
type HoverFinalize = StaticAssert<
  Same<HoverGestureFinalizeEvent, EventOf<HoverGestureConfig, 'onFinalize'>>
>;
type HoverEndEventsDiffer = StaticAssert<
  Same<HoverGestureDeactivateEvent, HoverGestureFinalizeEvent> extends false
    ? true
    : false
>;
