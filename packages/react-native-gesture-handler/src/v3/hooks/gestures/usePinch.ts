import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type PinchGestureProps = Record<string, never>;

type PinchHandlerData = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
};

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchHandlerData,
  PinchGestureProps
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

export function usePinch(config: PinchGestureConfig) {
  const pinchConfig = cloneConfig<PinchHandlerData, PinchGestureProps>(config);

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
