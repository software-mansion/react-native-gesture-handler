import type {
  LongPressGesture,
  LongPressGestureConfig,
  LongPressGestureInternalConfig,
  LongPressGestureInternalProperties,
  LongPressGestureProperties,
  LongPressHandlerData,
} from './LongPressTypes';
import { SingleGestureName } from '../../../types';
import { useClonedAndRemappedConfig } from '../../utils';
import { useGesture } from '../../useGesture';

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

export function useLongPressGesture(
  config: LongPressGestureConfig
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
