import type { GestureEvent, HandlerData } from '../../../types';
import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import {
  getChangeEventCalculator,
  useClonedAndRemappedConfig,
} from '../../utils';
import type {
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

const EMPTY_PINCH_CONFIG: PinchGestureConfig = {};

export function usePinchGesture(
  config: PinchGestureConfig = EMPTY_PINCH_CONFIG
): PinchGesture {
  const pinchConfig = useClonedAndRemappedConfig<
    PinchGestureProperties,
    PinchHandlerData,
    // no internal props, pass record as PinchGestureProperties maps everything to never
    Record<string, unknown>,
    PinchExtendedHandlerData
  >(config, PinchPropsMapping, transformPinchProps);

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
