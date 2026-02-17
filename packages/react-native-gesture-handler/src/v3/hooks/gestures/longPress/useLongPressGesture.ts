import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
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
  BaseDiscreteGestureConfig<LongPressGestureProperties, LongPressHandlerData>
>;

type LongPressGestureInternalConfig = BaseDiscreteGestureConfig<
  LongPressGestureInternalProperties,
  LongPressHandlerData
>;

export type LongPressGestureEvent = GestureEvent<LongPressHandlerData>;

export type LongPressGesture = SingleGesture<
  LongPressGestureProperties,
  LongPressHandlerData
>;

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
