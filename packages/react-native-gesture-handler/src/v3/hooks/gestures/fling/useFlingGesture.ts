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
import type { FlingGestureNativeProperties } from './FlingProperties';

type FlingHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

type FlingGestureProperties = WithSharedValue<FlingGestureNativeProperties>;

type FlingGestureInternalConfig = BaseDiscreteGestureConfig<
  FlingGestureProperties,
  FlingHandlerData
>;

export type FlingGestureConfig =
  ExcludeInternalConfigProps<FlingGestureInternalConfig>;

export type FlingGestureEvent = GestureEvent<FlingHandlerData>;

export type FlingGesture = SingleGesture<
  FlingGestureProperties,
  FlingHandlerData
>;

export function useFlingGesture(config: FlingGestureConfig): FlingGesture {
  const flingConfig = useClonedAndRemappedConfig<
    FlingGestureProperties,
    FlingHandlerData
  >(config);

  return useGesture(SingleGestureName.Fling, flingConfig);
}
