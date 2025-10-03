import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  HandlerData,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, getChangeEventCalculator } from '../utils';

type PinchGestureProperties = Record<string, never>;

type PinchHandlerData = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
  scaleChange: number;
};

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchHandlerData,
  PinchGestureProperties
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

function diffCalculator(
  current: HandlerData<PinchHandlerData>,
  previous: HandlerData<PinchHandlerData> | null
) {
  'worklet';
  return {
    scaleChange: previous ? current.scale / previous.scale : current.scale,
  };
}

export function usePinch(config: PinchGestureConfig) {
  const pinchConfig = cloneConfig<PinchHandlerData, PinchGestureProperties>(
    config
  );

  pinchConfig.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
