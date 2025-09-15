import { StylusData } from '../../../handlers/gestureHandlerCommon';
import { HoverEffect } from '../../../handlers/gestures/hoverGesture';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureUpdateEvent,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type HoverGestureProps = {
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
};

type HoverHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  stylusData: StylusData;
  changeX?: number;
  changeY?: number;
};

type HoverGestureInternalConfig = BaseGestureConfig<
  HoverHandlerData,
  HoverGestureProps
>;

export type HoverGestureConfig =
  ExcludeInternalConfigProps<HoverGestureInternalConfig>;

function changeEventCalculator(
  current: GestureUpdateEvent<HoverHandlerData>,
  previous?: GestureUpdateEvent<HoverHandlerData>
): GestureUpdateEvent<HoverHandlerData> {
  'worklet';

  const currentEventData = current.handlerData;
  const previousEventData = previous ? previous.handlerData : null;

  const changePayload = previousEventData
    ? {
        changeX: currentEventData.x - previousEventData.x,
        changeY: currentEventData.y - previousEventData.y,
      }
    : {
        changeX: currentEventData.x,
        changeY: currentEventData.y,
      };

  const resultEvent = { ...current };
  resultEvent.handlerData = { ...currentEventData, ...changePayload };

  return resultEvent;
}

export function useHover(config: HoverGestureConfig) {
  const hoverConfig = cloneConfig<HoverHandlerData, HoverGestureProps>(config);
  hoverConfig.changeEventCalculator = changeEventCalculator;

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
