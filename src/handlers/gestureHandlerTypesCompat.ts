import {
  FlingGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  GestureEvent,
  GestureEventPayload,
  HandlerStateChangeEvent,
  HandlerStateChangeEventPayload,
  LongPressGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from './gestureHandlers';
import { NativeViewGestureHandlerPayload } from './NativeViewGestureHandler';

export type GestureHandlerGestureEventNativeEvent = GestureEventPayload;
export type GestureHandlerStateChangeNativeEvent = HandlerStateChangeEventPayload;
export type GestureHandlerGestureEvent = GestureEvent;
export type GestureHandlerStateChangeEvent = HandlerStateChangeEvent;

export type NativeViewGestureHandlerGestureEvent = GestureEvent<NativeViewGestureHandlerPayload>;
export type NativeViewGestureHandlerStateChangeEvent = HandlerStateChangeEvent<NativeViewGestureHandlerPayload>;

export type TapGestureHandlerGestureEvent = GestureEvent<TapGestureHandlerEventPayload>;
export type TapGestureHandlerStateChangeEvent = HandlerStateChangeEvent<TapGestureHandlerEventPayload>;

export type ForceTouchGestureHandlerGestureEvent = GestureEvent<ForceTouchGestureHandlerEventPayload>;
export type ForceTouchGestureHandlerStateChangeEvent = HandlerStateChangeEvent<ForceTouchGestureHandlerEventPayload>;

export type LongPressGestureHandlerGestureEvent = GestureEvent<LongPressGestureHandlerEventPayload>;
export type LongPressGestureHandlerStateChangeEvent = HandlerStateChangeEvent<LongPressGestureHandlerEventPayload>;

export type PanGestureHandlerGestureEvent = GestureEvent<PanGestureHandlerEventPayload>;
export type PanGestureHandlerStateChangeEvent = HandlerStateChangeEvent<PanGestureHandlerEventPayload>;

export type PinchGestureHandlerGestureEvent = GestureEvent<PinchGestureHandlerEventPayload>;
export type PinchGestureHandlerStateChangeEvent = HandlerStateChangeEvent<PinchGestureHandlerEventPayload>;

export type RotationGestureHandlerGestureEvent = GestureEvent<RotationGestureHandlerEventPayload>;
export type RotationGestureHandlerStateChangeEvent = HandlerStateChangeEvent<RotationGestureHandlerEventPayload>;

export type FlingGestureHandlerGestureEvent = GestureEvent<FlingGestureHandlerEventPayload>;
export type FlingGestureHandlerStateChangeEvent = HandlerStateChangeEvent<FlingGestureHandlerEventPayload>;
