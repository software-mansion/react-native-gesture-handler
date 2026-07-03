import type {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvent,
  SingleGesture,
  SingleGestureName,
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

export type ManualGestureEvent = GestureEvent<ManualHandlerData>;
export type ManualGestureActiveEvent = ManualGestureEvent;

export type ManualGesture = SingleGesture<
  ManualGestureProperties,
  ManualHandlerData,
  ManualHandlerData,
  SingleGestureName.Manual
>;
