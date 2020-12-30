import React from 'react';
import {
  BaseGestureHandlerProperties,
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
  ForceTouchGestureHandlerProperties as ForceTouchGHProperties,
  TapGestureHandlerProperties as TapGHProperties,
  LongPressGestureHandlerProperties as LongPressGHProperties,
  PanGestureHandlerProperties as PanGHProperties,
  PinchGestureHandlerProperties as PinchGHProperties,
  RotationGestureHandlerProperties as RotationGHProperties,
  FlingGestureHandlerProperties as FlingGHProperties,
} from './gestureHandlers';
import {
  NativeViewGestureHandlerPayload,
  NativeViewGestureHandlerProperties as NativeViewGHProperties,
} from './NativeViewGestureHandler';

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

type StateEventNames =
  | 'onBegan'
  | 'onFailed'
  | 'onCancelled'
  | 'onActivated'
  | 'onEnded';
type BaseEventNames = 'onGestureEvent' | 'onHandlerStateChange';

export type GestureHandlerProperties = Omit<
  BaseGestureHandlerProperties,
  'minPointers' | StateEventNames | BaseEventNames
>;

export type NativeViewGestureHandlerProperties = Omit<
  NativeViewGHProperties,
  'minPointers' | StateEventNames
>;
export type TapGestureHandlerProperties = Omit<
  TapGHProperties,
  'minPointers' | StateEventNames
>;

export type ForceTouchGestureHandlerProperties = Omit<
  ForceTouchGHProperties,
  'minPointers' | StateEventNames
>;

export type LongPressGestureHandlerProperties = Omit<
  LongPressGHProperties,
  'minPointers' | StateEventNames
>;

export type PanGestureHandlerProperties = Omit<
  PanGHProperties,
  'minPointers' | StateEventNames
>;

export type PinchGestureHandlerProperties = Omit<
  PinchGHProperties,
  'minPointers' | StateEventNames
>;

export type RotationGestureHandlerProperties = Omit<
  RotationGHProperties,
  'minPointers' | StateEventNames
>;

export type FlingGestureHandlerProperties = Omit<
  FlingGHProperties,
  'minPointers' | StateEventNames
>;

export class NativeViewGestureHandler extends React.Component<NativeViewGestureHandlerProperties> {}
export class TapGestureHandler extends React.Component<TapGestureHandlerProperties> {}
export class LongPressGestureHandler extends React.Component<LongPressGestureHandlerProperties> {}
export class PanGestureHandler extends React.Component<PanGestureHandlerProperties> {}
export class PinchGestureHandler extends React.Component<PinchGestureHandlerProperties> {}
export class RotationGestureHandler extends React.Component<RotationGestureHandlerProperties> {}
export class FlingGestureHandler extends React.Component<FlingGestureHandlerProperties> {}
export class ForceTouchGestureHandler extends React.Component<ForceTouchGestureHandlerProperties> {}
