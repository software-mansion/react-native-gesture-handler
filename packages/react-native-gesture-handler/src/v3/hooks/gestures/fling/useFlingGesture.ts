import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureUpdateEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type { FlingGestureNativeProperties } from './FlingProperties';

type FlingHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

type FlingGestureProperties = WithSharedValue<FlingGestureNativeProperties>;

type FlingGestureInternalConfig = BaseDiscreteGestureConfig<
  FlingHandlerData,
  FlingGestureProperties
>;

export type FlingGestureConfig =
  ExcludeInternalConfigProps<FlingGestureInternalConfig>;

export type FlingGestureEvent = GestureUpdateEvent<FlingHandlerData>;

export type FlingGesture = SingleGesture<
  FlingHandlerData,
  FlingGestureProperties
>;

export function useFlingGesture(config: FlingGestureConfig): FlingGesture {
  const flingConfig = useClonedAndRemappedConfig<
    FlingHandlerData,
    FlingGestureProperties,
    FlingGestureProperties
  >(config);

  return useGesture(SingleGestureName.Fling, flingConfig);
}
