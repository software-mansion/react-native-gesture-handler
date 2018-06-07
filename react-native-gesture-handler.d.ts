// Project: https://github.com/kmagiera/react-native-gesture-handler
// TypeScript Version: 2.6.2

import * as React from 'react';
import {
  Animated,
  FlatListProperties,
  ScrollViewProperties,
  SliderProperties,
  SwitchProperties,
  TextInputProperties,
  WebViewProperties,
  ToolbarAndroidProperties,
  ViewPagerAndroidProperties,
  DrawerLayoutAndroidProperties,
  TouchableWithoutFeedbackProperties,
  Insets,
  ViewStyle,
  StyleProp,
} from 'react-native';

/* GESTURE HANDLER STATE */

export enum Directions {
  RIGHT = 1,
  LEFT = 2,
  UP = 4,
  DOWN = 8,
}

export enum State {
  UNDETERMINED = 0,
  FAILED,
  BEGAN,
  CANCELLED,
  ACTIVE,
  END,
}

/* STATE CHANGE EVENTS */

export interface GestureHandlerGestureEventNativeEvent {
  handlerTag: number;
  state: State;
}

export interface GestureHandlerStateChangeNativeEvent {
  handlerTag: number;
  state: State;
  oldState: State;
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
  nativeEvent: GestureHandlerStateChangeNativeEvent;
}

export interface FlingGestureHandlerGestureEvent
  extends GestureHandlerGestureEvent {
  nativeEvent: GestureHandlerGestureEventNativeEvent;
}

/* GESTURE HANDLERS PROPERTIES */

export interface GestureHandlerProperties {
  id?: string;
  enabled?: boolean;
  waitFor?: string | string[];
  simultaneousHandlers?: string | string[];
  shouldCancelWhenOutside?: boolean;
  hitSlop?:
    | number
    | {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
        vertical?: number;
        horizontal?: number;
      };
}

export interface NativeViewGestureHandlerProperties
  extends GestureHandlerProperties {
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
  onGestureEvent?: (event: NativeViewGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (
    event: NativeViewGestureHandlerStateChangeEvent
  ) => void;
}

export interface TapGestureHandlerProperties extends GestureHandlerProperties {
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

export interface LongPressGestureHandlerProperties
  extends GestureHandlerProperties {
  minDurationMs?: number;
  maxDist?: number;
  onGestureEvent?: (event: GestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: GestureHandlerStateChangeEvent) => void;
}

export interface PanGestureHandlerProperties extends GestureHandlerProperties {
  minDeltaX?: number;
  minDeltaY?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  minOffsetX?: number;
  minOffsetY?: number;
  minDist?: number;
  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;
  minPointers?: number;
  maxPointers?: number;
  avgTouches?: boolean;
  onGestureEvent?: (event: PanGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: PanGestureHandlerStateChangeEvent) => void;
}

export interface PinchGestureHandlerProperties
  extends GestureHandlerProperties {
  onGestureEvent?: (event: PinchGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (event: PinchGestureHandlerStateChangeEvent) => void;
}

export interface RotationGestureHandlerProperties
  extends GestureHandlerProperties {
  onGestureEvent?: (event: RotationGestureHandlerGestureEvent) => void;
  onHandlerStateChange?: (
    event: RotationGestureHandlerStateChangeEvent
  ) => void;
}

export interface FlingGestureHandlerProperties
  extends GestureHandlerProperties {
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

/* BUTTONS PROPERTIES */

export interface RawButtonProperties
  extends NativeViewGestureHandlerProperties {}

export interface BaseButtonProperties extends RawButtonProperties {
  onPress?: (pointerInside: boolean) => void;
  onActiveStateChange?: (active: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export interface RectButtonProperties extends BaseButtonProperties {
  underlayColor?: string;
}

export interface BorderlessButtonProperties extends BaseButtonProperties {
  borderless?: boolean;
}

/* BUTTONS CLASSES */

export class RawButton extends React.Component<RawButtonProperties> {}

export class BaseButton extends React.Component<BaseButtonProperties> {}

export class RectButton extends React.Component<RectButtonProperties> {}

export class BorderlessButton extends React.Component<
  BorderlessButtonProperties
> {}

/* GESTURE HANDLER WRAPPED CLASSES */

export class ScrollView extends React.Component<
  NativeViewGestureHandlerProperties & ScrollViewProperties
> {}

export class Slider extends React.Component<
  NativeViewGestureHandlerProperties & SliderProperties
> {}

export class Switch extends React.Component<
  NativeViewGestureHandlerProperties & SwitchProperties
> {}

export class TextInput extends React.Component<
  NativeViewGestureHandlerProperties & TextInputProperties
> {}

export class ToolbarAndroid extends React.Component<
  NativeViewGestureHandlerProperties & ToolbarAndroidProperties
> {}

export class ViewPagerAndroid extends React.Component<
  NativeViewGestureHandlerProperties & ViewPagerAndroidProperties
> {}

export class DrawerLayoutAndroid extends React.Component<
  NativeViewGestureHandlerProperties & DrawerLayoutAndroidProperties
> {}

export class WebView extends React.Component<
  NativeViewGestureHandlerProperties & WebViewProperties
> {}

/* OTHER */

export class FlatList extends React.Component<
  NativeViewGestureHandlerProperties & FlatListProperties<any>
> {}

export function gestureHandlerRootHOC(
  Component: React.ComponentType<any>,
  containerStyles?: StyleProp<ViewStyle>
): React.ComponentType<any>;

export interface SwipeableProperties {
  friction: number;
  leftThreshold?: number;
  rightThreshold?: number;
  overshootLeft?: boolean;
  overshootRight?: boolean;
  onSwipeableLeftOpen?: () => void;
  onSwipeableRightOpen?: () => void;
  onSwipeableOpen?: () => void;
  onSwipeableClose?: () => void;
  renderLeftActions?: (
    progressAnimatedValue: Animated.Value,
    dragAnimatedValue: Animated.Value
  ) => React.ReactNode;
  renderRightActions?: (
    progressAnimatedValue: Animated.Value,
    dragAnimatedValue: Animated.Value
  ) => React.ReactNode;
  useNativeAnimations?: boolean;
}

export class Swipeable extends React.Component<SwipeableProperties> {
  close: () => void;
}

export interface DrawerLayoutProperties {
  renderNavigationView: (
    progressAnimatedValue: Animated.Value
  ) => React.ReactNode;
  drawerPosition?: 'left' | 'right';
  drawerWidth?: number;
  drawerBackgroundColor?: string;
  keyboardDismissMode?: 'none' | 'on-drag';
  onDrawerClose?: () => void;
  onDrawerOpen?: () => void;
  onDrawerStateChanged?: (
    newState: 'Idle' | 'Dragging' | 'Settling',
    drawerWillShow: boolean
  ) => void;
  useNativeAnimations?: boolean;

  drawerType?: 'front' | 'back' | 'slide';
  edgeWidth?: number;
  minSwipeDistance?: number;
  hideStatusBar?: boolean;
  statusBarAnimation?: 'slide' | 'none' | 'fade';
  overlayColor?: string;
}

export interface DrawerMovementOptionType {
  velocity?: number;
}

export class DrawerLayout extends React.Component<DrawerLayoutProperties> {
  openDrawer: (options: DrawerMovementOptionType) => void;
  closeDrawer: (options?: DrawerMovementOptionType) => void;
}
