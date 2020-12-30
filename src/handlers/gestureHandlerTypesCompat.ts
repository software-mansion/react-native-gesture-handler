import React from 'react';
import {
  BaseGestureHandlerProperties,
  FlingGestureHandlerEventExtraPayload,
  ForceTouchGestureHandlerEventExtraPayload,
  GestureEvent,
  GestureEventPayload,
  HandlerStateChangeEvent,
  HandlerStateChangeEventPayload,
  LongPressGestureHandlerEventExtraPayload,
  PanGestureHandlerEventExtraPayload,
  PinchGestureHandlerEventExtraPayload,
  RotationGestureHandlerEventExtraPayload,
  TapGestureHandlerEventExtraPayload,
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

export type TapGestureHandlerGestureEvent = GestureEvent<TapGestureHandlerEventExtraPayload>;
export type TapGestureHandlerStateChangeEvent = HandlerStateChangeEvent<TapGestureHandlerEventExtraPayload>;

export type ForceTouchGestureHandlerGestureEvent = GestureEvent<ForceTouchGestureHandlerEventExtraPayload>;
export type ForceTouchGestureHandlerStateChangeEvent = HandlerStateChangeEvent<ForceTouchGestureHandlerEventExtraPayload>;

export type LongPressGestureHandlerGestureEvent = GestureEvent<LongPressGestureHandlerEventExtraPayload>;
export type LongPressGestureHandlerStateChangeEvent = HandlerStateChangeEvent<LongPressGestureHandlerEventExtraPayload>;

export type PanGestureHandlerGestureEvent = GestureEvent<PanGestureHandlerEventExtraPayload>;
export type PanGestureHandlerStateChangeEvent = HandlerStateChangeEvent<PanGestureHandlerEventExtraPayload>;

export type PinchGestureHandlerGestureEvent = GestureEvent<PinchGestureHandlerEventExtraPayload>;
export type PinchGestureHandlerStateChangeEvent = HandlerStateChangeEvent<PinchGestureHandlerEventExtraPayload>;

export type RotationGestureHandlerGestureEvent = GestureEvent<RotationGestureHandlerEventExtraPayload>;
export type RotationGestureHandlerStateChangeEvent = HandlerStateChangeEvent<RotationGestureHandlerEventExtraPayload>;

export type FlingGestureHandlerGestureEvent = GestureEvent<FlingGestureHandlerEventExtraPayload>;
export type FlingGestureHandlerStateChangeEvent = HandlerStateChangeEvent<FlingGestureHandlerEventExtraPayload>;

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
