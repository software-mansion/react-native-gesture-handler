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
import { PinchGestureNativeProperties } from './PinchProperties';

type PinchBaseHandlerData = {
  scale: number;
  velocity: number;
};

type PinchHandlerData = PinchBaseHandlerData & {
  focalX: number;
  focalY: number;
  scaleChange: number;
};

type PinchGestureProperties = PinchGestureNativeProperties;

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchBaseHandlerData,
  PinchHandlerData,
  PinchGestureProperties
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

export type PinchGestureEvent = GestureEvent<PinchHandlerData>;

export type PinchGesture = SingleGesture<
  PinchBaseHandlerData,
  PinchHandlerData,
  PinchGestureProperties
>;

function diffCalculator(
  current: HandlerData<PinchHandlerData>,
  previous: HandlerData<PinchHandlerData> | null
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
    PinchBaseHandlerData,
    PinchHandlerData,
    PinchGestureProperties,
    // no internal props, pass record as PinchGestureProperties maps everything to never
    Record<string, unknown>
  >(config, PinchPropsMapping, transformPinchProps);

  pinchConfig.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
