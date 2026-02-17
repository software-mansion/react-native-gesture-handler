import { HandlerData, SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import {
  useClonedAndRemappedConfig,
  getChangeEventCalculator,
} from '../../utils';
import {
  PinchExtendedHandlerData,
  PinchGesture,
  PinchGestureConfig,
  PinchGestureInternalConfig,
  PinchGestureProperties,
  PinchHandlerData,
} from './PinchTypes';

function diffCalculator(
  current: HandlerData<PinchExtendedHandlerData>,
  previous: HandlerData<PinchExtendedHandlerData> | null
) {
  'worklet';
  return {
    scaleChange: previous ? current.scale / previous.scale : current.scale,
  };
}

function transformPinchProps(
  config: PinchGestureConfig & PinchGestureInternalConfig
) {
  config.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return config;
}

const PinchPropsMapping = new Map<string, string>();

export function usePinchGesture(config: PinchGestureConfig): PinchGesture {
  const pinchConfig = useClonedAndRemappedConfig<
    PinchGestureProperties,
    PinchHandlerData,
    // no internal props, pass record as PinchGestureProperties maps everything to never
    Record<string, unknown>,
    PinchExtendedHandlerData
  >(config, PinchPropsMapping, transformPinchProps);

  pinchConfig.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
