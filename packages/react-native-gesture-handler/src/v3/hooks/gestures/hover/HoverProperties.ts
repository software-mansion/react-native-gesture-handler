import { HoverEffect } from '../../../../handlers/gestures/hoverGesture';

export type HoverGestureExternalProperties = {
  /**
   * Visual effect applied to the view while the view is hovered. The possible values are:
   *
   * - `HoverEffect.None`
   * - `HoverEffect.Lift`
   * - `HoverEffect.Highlight`
   *
   * Defaults to `HoverEffect.None`
   */
  effect?: HoverEffect;
};

export type HoverGestureNativeProperties = {
  hoverEffect: HoverEffect;
};

export const HoverNativeProperties = new Set<
  keyof HoverGestureNativeProperties
>(['hoverEffect']);
