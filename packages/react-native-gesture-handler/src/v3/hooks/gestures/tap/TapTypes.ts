import {
  BaseDiscreteGestureConfig,
  DiscreteSingleGesture,
  ExcludeInternalConfigProps,
  GestureEvent,
  WithSharedValue,
} from '../../../types';

type CommonTapGestureConfig = {
  /**
   * Minimum number of pointers (fingers) required to be placed before the
   * handler activates. Should be a positive integer.
   * The default value is 1.
   */
  minPointers?: number;

  /**
   * Number of tap gestures required to activate the handler. The default value
   * is 1.
   */
  numberOfTaps?: number;

  /**
   * Maximum distance, expressed in points, that defines how far the finger is
   * allowed to travel along the X axis during a tap gesture. If the finger
   * travels further than the defined distance along the X axis and the handler
   * hasn't yet activated, it will fail to recognize the gesture.
   */
  maxDeltaX?: number;

  /**
   * Maximum distance, expressed in points, that defines how far the finger is
   * allowed to travel along the Y axis during a tap gesture. If the finger
   * travels further than the defined distance along the Y axis and the handler
   * hasn't yet activated, it will fail to recognize the gesture.
   */
  maxDeltaY?: number;
};

export type TapGestureExternalConfig = CommonTapGestureConfig & {
  /**
   * Maximum time, expressed in milliseconds, that defines how fast a finger
   * must be released after a touch. The default value is 500.
   */
  maxDuration?: number;

  /**
   * Maximum time, expressed in milliseconds, that can pass before the next tap
   * if many taps are required. The default value is 500.
   */
  maxDelay?: number;

  /**
   * Maximum distance, expressed in points, that defines how far the finger is
   * allowed to travel during a tap gesture. If the finger travels further than
   * the defined distance and the handler hasn't yet
   * activated, it will fail to recognize the gesture.
   */
  maxDistance?: number;
};

export type TapGestureNativeConfig = CommonTapGestureConfig & {
  maxDurationMs?: number;
  maxDelayMs?: number;
  maxDist?: number;
};

export const TapNativeProperties = new Set<keyof TapGestureNativeConfig>([
  'minPointers',
  'numberOfTaps',
  'maxDeltaX',
  'maxDeltaY',
  'maxDurationMs',
  'maxDelayMs',
  'maxDist',
]);

export type TapHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type TapGestureProperties = WithSharedValue<TapGestureExternalConfig>;

export type TapGestureInternalProperties =
  WithSharedValue<TapGestureNativeConfig>;

export type TapGestureConfig = ExcludeInternalConfigProps<
  BaseDiscreteGestureConfig<TapGestureProperties, TapHandlerData>
>;

export type TapGestureEvent = GestureEvent<TapHandlerData>;
export type TapGestureActiveEvent = TapGestureEvent;

export type TapGesture = DiscreteSingleGesture<
  TapGestureInternalProperties,
  TapHandlerData
>;
