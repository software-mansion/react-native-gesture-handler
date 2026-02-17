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

type PinchHandlerData = {
  scale: number;
  velocity: number;
};

type PinchExtendedHandlerData = PinchHandlerData & {
  focalX: number;
  focalY: number;
  scaleChange: number;
};

type PinchGestureProperties = PinchGestureNativeProperties;

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchGestureProperties,
  PinchHandlerData,
  PinchExtendedHandlerData
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

export type PinchGestureEvent = GestureEvent<PinchHandlerData>;

export type PinchGesture = SingleGesture<
  PinchGestureProperties,
  PinchHandlerData,
  PinchExtendedHandlerData
>;

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
