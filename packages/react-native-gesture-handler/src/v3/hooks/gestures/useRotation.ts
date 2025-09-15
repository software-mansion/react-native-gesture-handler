import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type RotationGestureHandlerProps = {};

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
};

type RotationGestureInternalConfig = BaseGestureConfig<
  RotationHandlerData,
  RotationGestureHandlerProps
>;

export type RotationGestureConfig =
  ExcludeInternalConfigProps<RotationGestureInternalConfig>;

export function useRotation(config: RotationGestureConfig) {
  const rotationConfig = cloneConfig<
    RotationHandlerData,
    RotationGestureHandlerProps
  >(config);

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
