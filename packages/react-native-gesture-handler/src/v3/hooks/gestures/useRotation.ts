import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  HandlerData,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, getChangeEventCalculator } from '../utils';

type RotationGestureProps = {};

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
  rotationChange?: number;
};

type RotationGestureInternalConfig = BaseGestureConfig<
  RotationHandlerData,
  RotationGestureProps
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
  const rotationConfig = cloneConfig<RotationHandlerData, RotationGestureProps>(
    config
  );

  rotationConfig.changeEventCalculator =
    getChangeEventCalculator(diffCalculator);

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
