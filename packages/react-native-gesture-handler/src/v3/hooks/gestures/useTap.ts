import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, remapProps } from '../utils';

type TapGestureProps = {
  /**
   * Minimum number of pointers (fingers) required to be placed before the
   * handler activates. Should be a positive integer.
   * The default value is 1.
   */
  minPointers?: number;

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

  /**
   * Maximum distance, expressed in points, that defines how far the finger is
   * allowed to travel during a tap gesture. If the finger travels further than
   * the defined distance and the handler hasn't yet
   * activated, it will fail to recognize the gesture.
   */
  maxDistance?: number;
};

type TapGestureInternalProps = {
  minPointers?: number;
  numberOfTaps?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  maxDist?: number;
};

type TapHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type TapGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<TapHandlerData, TapGestureProps>
>;

type TapGestureInternalConfig = BaseGestureConfig<
  TapHandlerData,
  TapGestureInternalProps
>;

const TapPropsMapping = new Map<
  keyof TapGestureProps,
  keyof TapGestureInternalProps
>([
  ['maxDistance', 'maxDist'],
  ['maxDuration', 'maxDurationMs'],
  ['maxDelay', 'maxDelayMs'],
]);

export function useTap(config: TapGestureConfig) {
  const tapConfig = cloneConfig<TapHandlerData, TapGestureInternalProps>(
    config
  );

  remapProps<TapGestureConfig, TapGestureInternalConfig>(
    tapConfig,
    TapPropsMapping
  );

  return useGesture<TapHandlerData, TapGestureInternalProps>(
    SingleGestureName.Tap,
    tapConfig
  );
}
