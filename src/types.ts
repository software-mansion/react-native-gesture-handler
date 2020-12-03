import * as React from 'react';
import {
  Animated,
  FlatListProperties,
  ScrollViewProperties,
  SwitchProperties,
  TextInputProperties,
  DrawerLayoutAndroidProperties,
  TouchableHighlightProperties,
  TouchableOpacityProperties,
  TouchableNativeFeedbackProperties,
  TouchableWithoutFeedbackProperties,
  Insets,
  ViewStyle,
  StyleProp,
  ViewProps,
} from 'react-native';
import { BaseGestureHandlerProperties } from './handlers/Gestures';

import State from './State';

export type ValueOf<T> = T[keyof T];

export interface GestureHandlerGestureEventNativeEvent {
  handlerTag: number;
  numberOfPointers: number;
  state: typeof State;
}

export interface GestureHandlerStateChangeNativeEvent {
  handlerTag: number;
  numberOfPointers: number;
  state: typeof State;
  oldState: typeof State;
}

export interface GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent;
}

export interface GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent;
}

interface NativeViewGestureHandlerEventExtra {
  pointerInside: boolean;
}

export interface NativeViewGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    NativeViewGestureHandlerEventExtra;
}

export interface NativeViewGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    NativeViewGestureHandlerEventExtra;
}

interface TapGestureHandlerEventExtra {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
}

interface ForceTouchGestureHandlerEventExtra {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  force: number;
}

export interface TapGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    TapGestureHandlerEventExtra;
}

export interface TapGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    TapGestureHandlerEventExtra;
}

export interface ForceTouchGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    ForceTouchGestureHandlerEventExtra;
}

export interface LongPressGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    LongPressGestureHandlerEventExtra;
}

export interface ForceTouchGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    ForceTouchGestureHandlerEventExtra;
}

interface LongPressGestureHandlerEventExtra {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
}

export interface LongPressGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    LongPressGestureHandlerEventExtra;
}

interface PanGestureHandlerEventExtra {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
}

export interface PanGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    PanGestureHandlerEventExtra;
}

export interface PanGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    PanGestureHandlerEventExtra;
}

interface PinchGestureHandlerEventExtra {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
}

export interface PinchGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    PinchGestureHandlerEventExtra;
}

export interface PinchGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    PinchGestureHandlerEventExtra;
}

interface RotationGestureHandlerEventExtra {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
}

export interface RotationGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    RotationGestureHandlerEventExtra;
}

export interface RotationGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent &
    RotationGestureHandlerEventExtra;
}

export interface FlingGestureHandlerStateChangeEvent
  extends GestureHandlerStateChangeEvent {
  nativeEvent: GestureHandlerStateChangeNativeEvent &
    FlingGestureHandlerEventExtra;
}

export interface FlingGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent;
}

interface FlingGestureHandlerEventExtra {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
}

export interface TapGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  minPointers?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  numberOfTaps?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  maxDist?: number;
  onGestureEvent?: (event: TapGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: TapGestureHandlerStateChangeEvent) => void;
}

export interface ForceTouchGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  minForce?: number;
  maxForce?: number;
  feedbackOnActivation?: boolean;
  onGestureEvent?: (event: ForceTouchGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (
    event: ForceTouchGestureHandlerStateChangeEvent
  ) => void;
}

export interface LongPressGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  minDurationMs?: number;
  maxDist?: number;
  onGestureEvent?: (event: LongPressGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (
    event: LongPressGestureHandlerStateChangeEvent
  ) => void;
}

export interface PanGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  /** @deprecated  use activeOffsetX*/
  minDeltaX?: number;
  /** @deprecated  use activeOffsetY*/
  minDeltaY?: number;
  /** @deprecated  use failOffsetX*/
  maxDeltaX?: number;
  /** @deprecated  use failOffsetY*/
  maxDeltaY?: number;
  /** @deprecated  use activeOffsetX*/
  minOffsetX?: number;
  /** @deprecated  use failOffsetY*/
  minOffsetY?: number;
  activeOffsetY?: number | number[];
  activeOffsetX?: number | number[];
  failOffsetY?: number | number[];
  failOffsetX?: number | number[];
  minDist?: number;
  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;
  minPointers?: number;
  maxPointers?: number;
  avgTouches?: boolean;
  enableTrackpadTwoFingerGesture?: boolean;
  onGestureEvent?: (event: PanGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: PanGestureHandlerStateChangeEvent) => void;
}

export interface PinchGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  onGestureEvent?: (event: PinchGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: PinchGestureHandlerStateChangeEvent) => void;
}

export interface RotationGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  onGestureEvent?: (event: RotationGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (
    event: RotationGestureHandlerStateChangeEvent
  ) => void;
}

export interface FlingGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  direction?: number;
  numberOfPointers?: number;
  onGestureEvent?: (event: FlingGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: FlingGestureHandlerStateChangeEvent) => void;
}

/* GESTURE HANDLERS CLASSES */

export class NativeViewGestureHandler extends React.Component<
  NativeViewGestureHandlerProperties
> {}

export class TapGestureHandler extends React.Component<
  TapGestureHandlerProperties
> {}

export class LongPressGestureHandler extends React.Component<
  LongPressGestureHandlerProperties
> {}

export class PanGestureHandler extends React.Component<
  PanGestureHandlerProperties
> {}

export class PinchGestureHandler extends React.Component<
  PinchGestureHandlerProperties
> {}

export class RotationGestureHandler extends React.Component<
  RotationGestureHandlerProperties
> {}

export class FlingGestureHandler extends React.Component<
  FlingGestureHandlerProperties
> {}

export class ForceTouchGestureHandler extends React.Component<
  ForceTouchGestureHandlerProperties
> {}

/* BUTTONS CLASSES */

export interface ContainedTouchableProperties {
  containerStyle?: StyleProp<ViewStyle>;
}

export class TouchableWithoutFeedback extends React.Component<
  TouchableWithoutFeedbackProperties | ContainedTouchableProperties
> {}

/* GESTURE HANDLERS PROPERTIES */
export interface NativeViewGestureHandlerProperties
  extends BaseGestureHandlerProperties {
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
  onGestureEvent?: (event: NativeViewGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (
    event: NativeViewGestureHandlerStateChangeEvent
  ) => void;
}
