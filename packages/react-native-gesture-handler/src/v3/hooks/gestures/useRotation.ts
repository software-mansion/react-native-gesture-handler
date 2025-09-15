import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type RotationGestureProps = {};

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
};

type RotationGestureInternalConfig = BaseGestureConfig<
  RotationHandlerData,
  RotationGestureProps
>;

export type RotationGestureConfig =
  ExcludeInternalConfigProps<RotationGestureInternalConfig>;

export function useRotation(config: RotationGestureConfig) {
  const rotationConfig = cloneConfig<RotationHandlerData, RotationGestureProps>(
    config
  );

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
