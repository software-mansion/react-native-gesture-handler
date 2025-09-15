import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type PinchGestureHandlerProps = {};

type PinchHandlerData = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
};

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchHandlerData,
  PinchGestureHandlerProps
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

export function usePinch(config: PinchGestureConfig) {
  const pinchConfig = cloneConfig<PinchHandlerData, PinchGestureHandlerProps>(
    config
  );

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
