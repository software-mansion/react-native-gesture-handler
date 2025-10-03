import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvents,
  SingleGesture,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type PinchGestureProperties = Record<string, never>;

type PinchHandlerData = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
};

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchHandlerData,
  PinchGestureProperties
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

export function usePinch(config: PinchGestureConfig) {
  const pinchConfig = cloneConfig<PinchHandlerData, PinchGestureProperties>(
    config
  );

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}

export type PinchGestureEvent = GestureEvents<PinchHandlerData>;
export type PinchGestureType = SingleGesture<
  PinchHandlerData,
  PinchGestureProperties
>;
