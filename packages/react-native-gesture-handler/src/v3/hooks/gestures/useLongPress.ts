import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { remapProps } from '../utils';

type LongPressGestureProps = {
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
};

type LongPressGesturePropsInternal = {
  minDurationMs?: number;
  maxDist?: number;
  numberOfPointers?: number;
};

type LongPressHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  duration: number;
};

export type LongPressGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<LongPressHandlerData, LongPressGestureProps>
>;

type LongPressGestureInternalConfig = BaseGestureConfig<
  LongPressHandlerData,
  LongPressGesturePropsInternal
>;

const LongPressPropsMapping = new Map<
  keyof LongPressGestureProps,
  keyof LongPressGesturePropsInternal
>([
  ['minDuration', 'minDurationMs'],
  ['maxDistance', 'maxDist'],
]);

export function useLongPress(config: LongPressGestureConfig) {
  const longPressConfig = remapProps<
    LongPressGestureConfig,
    LongPressGestureInternalConfig
  >(config, LongPressPropsMapping);

  return useGesture<LongPressHandlerData, LongPressGesturePropsInternal>(
    SingleGestureName.LongPress,
    longPressConfig
  );
}
