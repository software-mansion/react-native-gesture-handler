import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  LongPressGesture,
  LongPressGestureConfig,
  LongPressGestureInternalConfig,
  LongPressGestureInternalProperties,
  LongPressGestureProperties,
  LongPressHandlerData,
} from './LongPressTypes';

const LongPressPropsMapping = new Map<
  keyof LongPressGestureProperties,
  keyof LongPressGestureInternalProperties
>([
  ['minDuration', 'minDurationMs'],
  ['maxDistance', 'maxDist'],
]);

function transformLongPressProps(
  config: LongPressGestureConfig & LongPressGestureInternalConfig
) {
  if (config.shouldCancelWhenOutside === undefined) {
    config.shouldCancelWhenOutside = true;
  }

  return config;
}

const EMPTY_LONG_PRESS_CONFIG: LongPressGestureConfig = {};

export function useLongPressGesture(
  config: LongPressGestureConfig = EMPTY_LONG_PRESS_CONFIG
): LongPressGesture {
  const longPressConfig = useClonedAndRemappedConfig<
    LongPressGestureProperties,
    LongPressHandlerData,
    LongPressGestureInternalProperties
  >(config, LongPressPropsMapping, transformLongPressProps);

  return useGesture<LongPressGestureInternalProperties, LongPressHandlerData>(
    SingleGestureName.LongPress,
    longPressConfig
  );
}
