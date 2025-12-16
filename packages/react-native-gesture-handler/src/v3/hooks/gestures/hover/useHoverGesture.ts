import { StylusData } from '../../../../handlers/gestureHandlerCommon';
import { HoverEffect } from '../../../../handlers/gestures/hoverGesture';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  HandlerData,
  SingleGestureName,
  WithSharedValue,
  GestureEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import {
  useClonedAndRemappedConfig,
  getChangeEventCalculator,
} from '../../utils';
import {
  HoverGestureExternalProperties,
  HoverGestureNativeProperties,
} from './HoverProperties';

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
  HoverGestureExternalProperties,
  HoverEffect
>;

type HoverGestureInternalProperties = WithSharedValue<
  HoverGestureNativeProperties,
  HoverEffect
>;

export type HoverGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<HoverHandlerData, HoverGestureProperties>
>;

type HoverGestureInternalConfig = BaseGestureConfig<
  HoverHandlerData,
  HoverGestureInternalProperties
>;

export type HoverGestureEvent = GestureEvent<HoverHandlerData>;

export type HoverGesture = SingleGesture<
  HoverHandlerData,
  HoverGestureInternalProperties
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

const HoverPropsMapping = new Map<string, string>([['effect', 'hoverEffect']]);

export function useHoverGesture(config: HoverGestureConfig): HoverGesture {
  const hoverConfig = useClonedAndRemappedConfig<
    HoverHandlerData,
    HoverGestureProperties,
    HoverGestureInternalProperties
  >(config, HoverPropsMapping, transformHoverProps);

  console.log('hoverConfig', hoverConfig);

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
