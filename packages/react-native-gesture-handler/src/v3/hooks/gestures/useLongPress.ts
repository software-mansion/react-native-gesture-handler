import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvents,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, remapProps } from '../utils';

type LongPressGestureProperties = WithSharedValue<{
  /**
   * Minimum time, expressed in milliseconds, that a finger must remain pressed on
   * the corresponding view. The default value is 500.
   */
  minDuration?: number;

  /**
   * Maximum distance, expressed in points, that defines how far the finger is
   * allowed to travel during a long press gesture. If the finger travels
   * further than the defined distance and the handler hasn't yet activated, it
   * will fail to recognize the gesture. The default value is 10.
   */
  maxDistance?: number;

  /**
   * Determine exact number of points required to handle the long press gesture.
   */
  numberOfPointers?: number;
}>;

type LongPressGestureInternalProperties = WithSharedValue<{
  minDurationMs?: number;
  maxDist?: number;
  numberOfPointers?: number;
}>;

type LongPressHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  duration: number;
};

export type LongPressGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<LongPressHandlerData, LongPressGestureProperties>
>;

type LongPressGestureInternalConfig = BaseGestureConfig<
  LongPressHandlerData,
  LongPressGestureInternalProperties
>;

const LongPressPropsMapping = new Map<
  keyof LongPressGestureProperties,
  keyof LongPressGestureInternalProperties
>([
  ['minDuration', 'minDurationMs'],
  ['maxDistance', 'maxDist'],
]);

export function useLongPress(config: LongPressGestureConfig) {
  const longPressConfig = cloneConfig<
    LongPressHandlerData,
    LongPressGestureInternalProperties
  >(config);

  remapProps<LongPressGestureConfig, LongPressGestureInternalConfig>(
    longPressConfig,
    LongPressPropsMapping
  );

  if (longPressConfig.shouldCancelWhenOutside === undefined) {
    longPressConfig.shouldCancelWhenOutside = true;
  }

  return useGesture<LongPressHandlerData, LongPressGestureInternalProperties>(
    SingleGestureName.LongPress,
    longPressConfig
  );
}

export type LongPressGestureEvent = GestureEvents<LongPressHandlerData>;
export type LongPressGesture = SingleGesture<
  LongPressHandlerData,
  LongPressGestureProperties
>;
