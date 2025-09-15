import { StylusData } from '../../../handlers/gestureHandlerCommon';
import { HoverEffect } from '../../../handlers/gestures/hoverGesture';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
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
};

type HoverGestureInternalConfig = BaseGestureConfig<
  HoverHandlerData,
  HoverGestureProps
>;

export type HoverGestureConfig =
  ExcludeInternalConfigProps<HoverGestureInternalConfig>;

export function useHover(config: HoverGestureConfig) {
  const hoverConfig = cloneConfig<HoverHandlerData, HoverGestureProps>(config);

  return useGesture(SingleGestureName.Hover, hoverConfig);
}
