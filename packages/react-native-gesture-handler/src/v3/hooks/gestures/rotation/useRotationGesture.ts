import { HandlerData, SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import {
  useClonedAndRemappedConfig,
  getChangeEventCalculator,
} from '../../utils';
import {
  RotationExtendedHandlerData,
  RotationGesture,
  RotationGestureConfig,
  RotationGestureInternalConfig,
  RotationGestureProperties,
  RotationHandlerData,
} from './RotationTypes';

function diffCalculator(
  current: HandlerData<RotationExtendedHandlerData>,
  previous: HandlerData<RotationExtendedHandlerData> | null
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
    RotationGestureProperties,
    RotationHandlerData,
    // no internal props, pass record as RotationGestureProperties maps everything to never
    Record<string, unknown>,
    RotationExtendedHandlerData
  >(config, RotationPropsMapping, transformRotationProps);

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
