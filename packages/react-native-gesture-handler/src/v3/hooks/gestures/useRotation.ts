import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type RotationGestureProperties = Record<string, never>;

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
};

type RotationGestureInternalConfig = BaseGestureConfig<
  RotationHandlerData,
  RotationGestureProperties
>;

export type RotationGestureConfig =
  ExcludeInternalConfigProps<RotationGestureInternalConfig>;

export function useRotation(config: RotationGestureConfig) {
  const rotationConfig = cloneConfig<
    RotationHandlerData,
    RotationGestureProperties
  >(config);

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
