import { StylusData } from '../../../../handlers/gestureHandlerCommon';
import { HoverEffect } from '../../../../handlers/gestures/hoverGesture';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  HandlerData,
  SingleGestureName,
  WithSharedValue,
  GestureUpdateEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import {
  useClonedAndRemappedConfig,
  getChangeEventCalculator,
} from '../../utils';
import { HoverGestureNativeProperties } from './HoverProperties';

type HoverHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  stylusData: StylusData;
  changeX: number;
  changeY: number;
};

type HoverGestureProperties = WithSharedValue<
  HoverGestureNativeProperties,
  HoverEffect
>;

type HoverGestureInternalConfig = BaseGestureConfig<
  HoverHandlerData,
  HoverGestureProperties
>;

export type HoverGestureConfig =
  ExcludeInternalConfigProps<HoverGestureInternalConfig>;

export type HoverGestureEvent = GestureUpdateEvent<HoverHandlerData>;

export type HoverGesture = SingleGesture<
  HoverHandlerData,
  HoverGestureProperties
>;

function diffCalculator(
  current: HandlerData<HoverHandlerData>,
  previous: HandlerData<HoverHandlerData> | null
) {
  'worklet';
  return {
    changeX: previous ? current.x - previous.x : 0,
    changeY: previous ? current.y - previous.y : 0,
  };
}

function transformHoverProps(
  config: HoverGestureConfig & HoverGestureInternalConfig
) {
  config.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return config;
}

const HoverPropsMapping = new Map<string, string>();

export function useHoverGesture(config: HoverGestureConfig): HoverGesture {
  const hoverConfig = useClonedAndRemappedConfig<
    HoverHandlerData,
    HoverGestureProperties,
    HoverGestureProperties
  >(config, HoverPropsMapping, transformHoverProps);

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
