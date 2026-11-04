import type { StylusData } from '../../../../handlers/gestureHandlerCommon';
import type { HoverEffect } from '../../../../HoverEffect';
import type {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEndEvent,
  GestureEvent,
  SingleGesture,
  WithSharedValue,
} from '../../../types';

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

export type HoverHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  stylusData: StylusData;
};

export type HoverExtendedHandlerData = HoverHandlerData & {
  changeX: number;
  changeY: number;
};

export type HoverGestureProperties = WithSharedValue<
  HoverGestureExternalProperties,
  HoverEffect
>;

export type HoverGestureInternalProperties = WithSharedValue<
  HoverGestureNativeProperties,
  HoverEffect
>;

export type HoverGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<
    HoverGestureProperties,
    HoverHandlerData,
    HoverExtendedHandlerData
  >
>;

export type HoverGestureInternalConfig = BaseGestureConfig<
  HoverGestureInternalProperties,
  HoverHandlerData,
  HoverExtendedHandlerData
>;

export type HoverGestureBeginEvent = GestureEvent<HoverHandlerData>;
export type HoverGestureActiveEvent = GestureEvent<HoverExtendedHandlerData>;
export type HoverGestureDeactivateEvent =
  GestureEndEvent<HoverExtendedHandlerData>;
export type HoverGestureFinalizeEvent = GestureEndEvent<HoverHandlerData>;
/** @deprecated Use `HoverGestureBeginEvent` instead. */
export type HoverGestureEvent = HoverGestureBeginEvent;

export type HoverGesture = SingleGesture<
  HoverGestureInternalProperties,
  HoverHandlerData,
  HoverExtendedHandlerData
>;
