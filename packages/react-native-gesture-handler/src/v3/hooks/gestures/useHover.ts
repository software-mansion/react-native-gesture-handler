import { StylusData } from '../../../handlers/gestureHandlerCommon';
import { HoverEffect } from '../../../handlers/gestures/hoverGesture';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  HandlerData,
  SingleGestureName,
  WithSharedValue,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, getChangeEventCalculator } from '../utils';

type HoverGestureProperties = WithSharedValue<
  {
    /**
     * Visual effect applied to the view while the view is hovered. The possible values are:
     *
     * - `HoverEffect.None`
     * - `HoverEffect.Lift`
     * - `HoverEffect.Highlight`
     *
     * Defaults to `HoverEffect.None`
     */
    hoverEffect?: HoverEffect;
  },
  HoverEffect
>;

type HoverHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  stylusData: StylusData;
  changeX: number;
  changeY: number;
};

type HoverGestureInternalConfig = BaseGestureConfig<
  HoverHandlerData,
  HoverGestureProperties
>;

export type HoverGestureConfig =
  ExcludeInternalConfigProps<HoverGestureInternalConfig>;

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

export function useHover(config: HoverGestureConfig) {
  const hoverConfig = cloneConfig<HoverHandlerData, HoverGestureProperties>(
    config
  );

  hoverConfig.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
