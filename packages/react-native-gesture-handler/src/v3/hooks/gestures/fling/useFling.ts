import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { cloneConfig } from '../../utils';
import type { FlingGestureNativeProperties } from './FlingProperties';

type FlingHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

type FlingGestureProperties = WithSharedValue<FlingGestureNativeProperties>;

type FlingGestureInternalConfig = BaseGestureConfig<
  FlingHandlerData,
  FlingGestureProperties
>;

export type FlingGestureConfig =
  ExcludeInternalConfigProps<FlingGestureInternalConfig>;

export function useFling(config: FlingGestureConfig) {
  const flingConfig = cloneConfig<FlingHandlerData, FlingGestureProperties>(
    config
  );

  return useGesture(SingleGestureName.Fling, flingConfig);
}

export type FlingGestureStateChangeEvent =
  GestureStateChangeEvent<FlingHandlerData>;
export type FlingGestureUpdateEvent = GestureUpdateEvent<FlingHandlerData>;

export type FlingGesture = SingleGesture<
  FlingHandlerData,
  FlingGestureProperties
>;
