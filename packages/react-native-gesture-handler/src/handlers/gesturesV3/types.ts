import { BaseGestureConfig, HandlerCallbacks } from '../gestures/gesture';

export type GestureName =
  | 'TapGestureHandler'
  | 'LongPressGestureHandler'
  | 'PanGestureHandler'
  | 'PinchGestureHandler'
  | 'RotationGestureHandler'
  | 'FlingGestureHandler'
  | 'ForceTouchGestureHandler'
  | 'ManualGestureHandler'
  | 'HoverGestureHandler'
  | 'NativeViewGestureHandler';

export type BaseConfigObjectType<T extends Record<string, unknown>> =
  BaseGestureConfig &
    Omit<
      HandlerCallbacks<T>,
      'gestureId' | 'handlerTag' | 'isWorklet' | 'changeEventCalculator'
    >;

export interface _NativeGesture<TConfig> {
  tag: number;
  name: GestureName;
  config: TConfig;
}

export type ConfigDiff = {
  added: Record<string, unknown>;
  updated: Record<string, unknown>;
  removed: Record<string, unknown>;
};
