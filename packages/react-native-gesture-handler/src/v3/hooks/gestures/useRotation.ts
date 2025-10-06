import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvents,
  SingleGesture,
  HandlerData,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, getChangeEventCalculator } from '../utils';

type RotationGestureProperties = Record<string, never>;

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
  rotationChange: number;
};

type RotationGestureInternalConfig = BaseGestureConfig<
  RotationHandlerData,
  RotationGestureProperties
>;

export type RotationGestureConfig =
  ExcludeInternalConfigProps<RotationGestureInternalConfig>;

function diffCalculator(
  current: HandlerData<RotationHandlerData>,
  previous: HandlerData<RotationHandlerData> | null
) {
  'worklet';
  return {
    rotationChange: previous
      ? current.rotation - previous.rotation
      : current.rotation,
  };
}

export function useRotation(config: RotationGestureConfig) {
  const rotationConfig = cloneConfig<
    RotationHandlerData,
    RotationGestureProperties
  >(config);

  rotationConfig.changeEventCalculator =
    getChangeEventCalculator(diffCalculator);

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}

export type RotationGestureEvent = GestureEvents<RotationHandlerData>;
export type RotationGesture = SingleGesture<
  RotationHandlerData,
  RotationGestureProperties
>;
