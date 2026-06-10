import type { GestureEvent, HandlerData } from '../../../types';
import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import {
  getChangeEventCalculator,
  useClonedAndRemappedConfig,
} from '../../utils';
import type {
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

function fillInDefaultValues(event: GestureEvent<HoverExtendedHandlerData>) {
  'worklet';

  event.changeX = 0;
  event.changeY = 0;
}

function transformHoverProps(
  config: HoverGestureConfig & HoverGestureInternalConfig
) {
  config.changeEventCalculator = getChangeEventCalculator(diffCalculator);
  config.fillInDefaultValues = fillInDefaultValues;

  return config;
}

const HoverPropsMapping = new Map<string, string>([['effect', 'hoverEffect']]);

const EMPTY_HOVER_CONFIG: HoverGestureConfig = {};

export function useHoverGesture(
  config: HoverGestureConfig = EMPTY_HOVER_CONFIG
): HoverGesture {
  const hoverConfig = useClonedAndRemappedConfig<
    HoverGestureProperties,
    HoverHandlerData,
    HoverGestureInternalProperties,
    HoverExtendedHandlerData
  >(config, HoverPropsMapping, transformHoverProps);

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
