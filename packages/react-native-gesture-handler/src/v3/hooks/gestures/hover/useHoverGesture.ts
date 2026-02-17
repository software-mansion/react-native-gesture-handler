import { HandlerData, SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import {
  useClonedAndRemappedConfig,
  getChangeEventCalculator,
} from '../../utils';
import {
  HoverExtendedHandlerData,
  HoverGesture,
  HoverGestureConfig,
  HoverGestureInternalConfig,
  HoverGestureInternalProperties,
  HoverGestureProperties,
  HoverHandlerData,
} from './HoverTypes';

function diffCalculator(
  current: HandlerData<HoverExtendedHandlerData>,
  previous: HandlerData<HoverExtendedHandlerData> | null
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
    HoverGestureProperties,
    HoverHandlerData,
    HoverGestureInternalProperties,
    HoverExtendedHandlerData
  >(config, HoverPropsMapping, transformHoverProps);

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
