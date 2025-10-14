import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  HandlerData,
  SingleGestureName,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { cloneConfig, getChangeEventCalculator } from '../../utils';
import { RotationGestureNativeProperties } from './RotationProperties';

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
  rotationChange: number;
};

type RotationGestureProperties = RotationGestureNativeProperties;

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
