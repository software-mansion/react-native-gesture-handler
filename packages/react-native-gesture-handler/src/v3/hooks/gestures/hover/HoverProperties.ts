import { HoverEffect } from '../../../../handlers/gestures/hoverGesture';

export type HoverGestureNativeProperties = {
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

export const HoverNativeProperties = new Set<
  keyof HoverGestureNativeProperties
>(['hoverEffect']);
