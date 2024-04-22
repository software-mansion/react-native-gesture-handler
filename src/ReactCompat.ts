/*
  This file was created in order to run Gesture Handler with Next.js. Metro is better at resolving file extensions than other bundlers, 
  so right now we have 3 types of extensions to add pure React compatibility:

  - .ts files are used by Next.js 
  - .web.ts files are used by react-native-web
  - .native.ts files are used by react-native

  With this approach we can run Next apps directly from our repository, without introducing drastic changes into our source code.
*/

/* eslint-disable */

import { Component } from 'react';
import { findDOMNode } from 'react-dom';

const ReactNative = {
  Easing: {
    inOut: (_a: any) => null,
    quad: null,
  },
  processColor: (a: any) => a,
  StyleSheet: {
    create: (a: any) => a,
    absoluteFillObject: {},
    flatten: (a: any) => a,
    compose: (a: any, _b: any) => a,
  },
  StyleProp: null!,
  ViewStyle: null!,
  View: null!,
  TouchableWithoutFeedbackProps: null!,
  TouchableNativeFeedback: null!,
  DrawerLayoutAndroid: null!,
  I18nManager: { isRTL: false },
  LayoutChangeEvent: null!,
  Keyboard: {
    dismiss: () => null!,
  },
  StatusBar: {
    setHidden: (_a: boolean, _b: unknown) => null!,
  },
  NativeSyntheticEvent: null!,
  PixelRatio: { get: () => window.devicePixelRatio },

  UIManager: {},
  DeviceEventEmitter: {
    addListener: (_a: string, _b: unknown) => null!,
  },
  // @ts-ignore Process is defined, but we don't want to add `node` types.
  isDEV: process.env.NODE_ENV === 'development',
  NativeModules: null!,
  Platform: { OS: 'web', constants: {} },
  findNodeHandle: (a: any) => findDOMNode(a),
};

export namespace Animated {
  export function createAnimatedComponent(a: any) {
    return a;
  }

  export function multiply(_a: unknown, _b: unknown) {
    return new Animated.Value(0);
  }

  export function add(_a: unknown, _b: unknown) {
    return new Animated.Value(0);
  }

  export function event(_a: unknown, _b: unknown) {
    return undefined;
  }

  export function spring(_a: unknown, _b: unknown) {
    return { start: (_a: ({ finished }: { finished: any }) => void) => null };
  }

  export function View(_props: any) {
    return null;
  }

  export function timing(_a: any, _b: any) {
    return { start: () => null };
  }

  export class Value {
    constructor(_a: unknown) {}
    setValue = (_a: unknown) => {};
    interpolate = (_a: unknown) => this;
  }
}

export const {
  Easing,
  processColor,
  StyleSheet,
  TouchableNativeFeedback,
  DrawerLayoutAndroid,
  I18nManager,
  Keyboard,
  StatusBar,
  UIManager,
  DeviceEventEmitter,
  isDEV,
  NativeModules,
  Platform,
  PixelRatio,
  findNodeHandle,
} = ReactNative;

export interface NativeSyntheticEvent<T> {
  nativeEvent: T;
}
export interface LayoutChangeEvent {
  nativeEvent: any;
}

export type EmitterSubscription = {
  remove: () => void;
};
export type StyleProp<_> = null;
export type TouchableHighlightProps = {
  activeOpacity: any;
  underlayColor: any;
  onShowUnderlay: () => void;
  onHideUnderlay: () => void;
};
export type TouchableOpacityProps = { style: ViewStyle; activeOpacity: any };
export type ColorValue = null;
export interface TouchableWithoutFeedbackProps {
  delayPressIn: any;
  delayPressOut: any;
  delayLongPress: any;
  accessible: any;
  accessibilityLabel: any;
  accessibilityHint: any;
  accessibilityRole: any;
  accessibilityState: any;
  accessibilityActions: any;
  onAccessibilityAction: any;
  onLayout: any;
  disabled: any;
  testID: any;
  touchSoundDisabled: any;
  style: any;
  children: any;
}
export type Insets = number | undefined;
export type SwitchProps = null;
export type TextInputProps = null;
export type DrawerLayoutAndroidProps = null;
export type StatusBarAnimation = null;

export class RefreshControl extends Component {}

export function RNDrawerLayoutAndroid(_props: any) {
  return null;
}
export type RNDrawerLayoutAndroid = typeof RNDrawerLayoutAndroid;

export function ScrollView(_props: any) {
  return null;
}
export type ScrollView = typeof ScrollView;
export type ScrollViewProps = any;

export function Switch(_props: any) {
  return null;
}
export type Switch = typeof Switch;

export function TextInput(_props: any) {
  return null;
}
export type TextInput = typeof TextInput;

export function FlatList(_props: any) {
  return null;
}

export type FlatListProps<_> = {};

export type ViewStyle = {
  [key: string]: any;
};

export interface ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  hitSlop?: Insets | undefined;

  [key: string]: any;
}

export class View extends Component<ViewProps> {
  public children: any;
  setNativeProps = (_props: any) => {};

  render() {
    return null;
  }
}

export const REACT_NATIVE_VERSION = { minor: -1, major: -1 };

/* eslint-enable */
