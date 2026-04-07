import { GestureEvent, HandlerData, SingleGestureName } from '../../../types';
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

function fillInDefaultValues(event: GestureEvent<PinchExtendedHandlerData>) {
  'worklet';
  event.scaleChange = 1;
}

function transformPinchProps(
  config: PinchGestureConfig & PinchGestureInternalConfig
) {
  config.changeEventCalculator = getChangeEventCalculator(diffCalculator);
  config.fillInDefaultValues = fillInDefaultValues;

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

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
