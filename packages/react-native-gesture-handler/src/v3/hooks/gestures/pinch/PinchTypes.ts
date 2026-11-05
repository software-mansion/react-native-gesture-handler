import type {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEndEvent,
  GestureEvent,
  SingleGesture,
} from '../../../types';

export type PinchGestureNativeProperties = Record<string, never>;

// We want to keep `{}` because it does not break ts-server suggestions
// eslint-disable-next-line @typescript-eslint/ban-types
export type PinchHandlerData = {};

export type PinchExtendedHandlerData = {
  scale: number;
  velocity: number;
  focalX: number;
  focalY: number;
  scaleChange: number;
};

export type PinchGestureProperties = PinchGestureNativeProperties;

export type PinchGestureInternalConfig = BaseGestureConfig<
  PinchGestureProperties,
  PinchHandlerData,
  PinchExtendedHandlerData
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

export type PinchGestureBeginEvent = GestureEvent<PinchHandlerData>;
export type PinchGestureActiveEvent = GestureEvent<PinchExtendedHandlerData>;
export type PinchGestureDeactivateEvent =
  GestureEndEvent<PinchExtendedHandlerData>;
export type PinchGestureFinalizeEvent = GestureEndEvent<PinchHandlerData>;
/** @deprecated Use `PinchGestureBeginEvent` instead. */
export type PinchGestureEvent = PinchGestureBeginEvent;

export type PinchGesture = SingleGesture<
  PinchGestureProperties,
  PinchHandlerData,
  PinchExtendedHandlerData
>;
