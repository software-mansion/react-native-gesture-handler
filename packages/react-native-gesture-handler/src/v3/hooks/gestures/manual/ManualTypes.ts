import type {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEndEvent,
  GestureEvent,
  SingleGesture,
} from '../../../types';

export type ManualGestureNativeProperties = Record<string, never>;

export type ManualHandlerData = Record<string, never>;

export type ManualGestureProperties = ManualGestureNativeProperties;

export type ManualGestureInternalConfig = BaseGestureConfig<
  ManualGestureProperties,
  ManualHandlerData
>;

export type ManualGestureConfig =
  ExcludeInternalConfigProps<ManualGestureInternalConfig>;

export type ManualGestureBeginEvent = GestureEvent<ManualHandlerData>;
export type ManualGestureActiveEvent = ManualGestureBeginEvent;
export type ManualGestureDeactivateEvent = GestureEndEvent<ManualHandlerData>;
export type ManualGestureFinalizeEvent = GestureEndEvent<ManualHandlerData>;
/** @deprecated Use `ManualGestureBeginEvent` instead. */
export type ManualGestureEvent = ManualGestureBeginEvent;

export type ManualGesture = SingleGesture<
  ManualGestureProperties,
  ManualHandlerData
>;
