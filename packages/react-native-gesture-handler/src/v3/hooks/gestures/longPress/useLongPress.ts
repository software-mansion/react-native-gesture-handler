import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
  WithSharedValue,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { cloneConfig, remapProps } from '../../utils';
import {
  LongPressGestureExternalProperties,
  LongPressGestureNativeProperties,
} from './LongPressProperties';

type LongPressHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  duration: number;
};

type LongPressGestureProperties =
  WithSharedValue<LongPressGestureExternalProperties>;

type LongPressGestureInternalProperties =
  WithSharedValue<LongPressGestureNativeProperties>;

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
