import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  HandlerData,
  SingleGestureName,
  GestureEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import {
  useClonedAndRemappedConfig,
  getChangeEventCalculator,
} from '../../utils';
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

export type RotationGestureEvent = GestureEvent<RotationHandlerData>;

export type RotationGesture = SingleGesture<
  RotationHandlerData,
  RotationGestureProperties
>;

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

function transformRotationProps(
  config: RotationGestureConfig & RotationGestureInternalConfig
) {
  config.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return config;
}

const RotationPropsMapping = new Map<string, string>();

export function useRotationGesture(
  config: RotationGestureConfig
): RotationGesture {
  const rotationConfig = useClonedAndRemappedConfig<
    RotationHandlerData,
    RotationGestureProperties,
    // no internal props, pass record as RotationGestureProperties maps everything to never
    Record<string, unknown>
  >(config, RotationPropsMapping, transformRotationProps);

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
