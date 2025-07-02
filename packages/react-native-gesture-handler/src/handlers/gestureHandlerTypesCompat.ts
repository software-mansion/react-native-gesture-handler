import type {
  BaseButtonProps,
  BorderlessButtonProps,
  RawButtonProps,
  RectButtonProps,
} from '../components/GestureButtonsProps';
import {
  GestureEvent,
  GestureEventPayload,
  HandlerStateChangeEvent,
  HandlerStateChangeEventPayload,
} from './gestureHandlerCommon';
import type { FlingGestureHandlerProps } from './FlingGestureHandler';
import type {
  FlingGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  NativeViewGestureHandlerPayload,
} from './GestureHandlerEventPayload';
import type { ForceTouchGestureHandlerProps } from './ForceTouchGestureHandler';
import type { LongPressGestureHandlerProps } from './LongPressGestureHandler';
import type { PanGestureHandlerProps } from './PanGestureHandler';
import type { PinchGestureHandlerProps } from './PinchGestureHandler';
import type { RotationGestureHandlerProps } from './RotationGestureHandler';
import type { TapGestureHandlerProps } from './TapGestureHandler';
import type { NativeViewGestureHandlerProps } from './NativeViewGestureHandler';

// Events
export type GestureHandlerGestureEventNativeEvent = GestureEventPayload;
export type GestureHandlerStateChangeNativeEvent =
  HandlerStateChangeEventPayload;
export type GestureHandlerGestureEvent = GestureEvent;
export type GestureHandlerStateChangeEvent = HandlerStateChangeEvent;
// Gesture handlers events
export type NativeViewGestureHandlerGestureEvent =
  GestureEvent<NativeViewGestureHandlerPayload>;
export type NativeViewGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<NativeViewGestureHandlerPayload>;

export type TapGestureHandlerGestureEvent =
  GestureEvent<TapGestureHandlerEventPayload>;
export type TapGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<TapGestureHandlerEventPayload>;

/**
 * @deprecated ForceTouchGestureHandler is deprecated and will be removed in the future.
 */
export type ForceTouchGestureHandlerGestureEvent =
  GestureEvent<ForceTouchGestureHandlerEventPayload>;
/**
 * @deprecated ForceTouchGestureHandler is deprecated and will be removed in the future.
 */
export type ForceTouchGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<ForceTouchGestureHandlerEventPayload>;

export type LongPressGestureHandlerGestureEvent =
  GestureEvent<LongPressGestureHandlerEventPayload>;
export type LongPressGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<LongPressGestureHandlerEventPayload>;

export type PanGestureHandlerGestureEvent =
  GestureEvent<PanGestureHandlerEventPayload>;
export type PanGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<PanGestureHandlerEventPayload>;

export type PinchGestureHandlerGestureEvent =
  GestureEvent<PinchGestureHandlerEventPayload>;
export type PinchGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<PinchGestureHandlerEventPayload>;

export type RotationGestureHandlerGestureEvent =
  GestureEvent<RotationGestureHandlerEventPayload>;
export type RotationGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<RotationGestureHandlerEventPayload>;

export type FlingGestureHandlerGestureEvent =
  GestureEvent<FlingGestureHandlerEventPayload>;
export type FlingGestureHandlerStateChangeEvent =
  HandlerStateChangeEvent<FlingGestureHandlerEventPayload>;

// Handlers properties
export type NativeViewGestureHandlerProperties = NativeViewGestureHandlerProps;
export type TapGestureHandlerProperties = TapGestureHandlerProps;
export type LongPressGestureHandlerProperties = LongPressGestureHandlerProps;
export type PanGestureHandlerProperties = PanGestureHandlerProps;
export type PinchGestureHandlerProperties = PinchGestureHandlerProps;
export type RotationGestureHandlerProperties = RotationGestureHandlerProps;
export type FlingGestureHandlerProperties = FlingGestureHandlerProps;
/**
 * @deprecated ForceTouch gesture is deprecated and will be removed in the future.
 */
export type ForceTouchGestureHandlerProperties = ForceTouchGestureHandlerProps;
// Button props
export type RawButtonProperties = RawButtonProps;
export type BaseButtonProperties = BaseButtonProps;
export type RectButtonProperties = RectButtonProps;
export type BorderlessButtonProperties = BorderlessButtonProps;
