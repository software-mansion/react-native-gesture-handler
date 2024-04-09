/*
  This file was created in order to run Gesture Handler with Next.js. Metro is better at resolving file extensions than other bundlers, 
  so right now we have 3 types of extensions to add pure React compatibility:

  - .ts files are used by Next.js 
  - .web.ts files are used by react-native-web
  - .native.ts files are used by react-native

  With this approach we can run Next apps directly from our repository, without introducing drastic changes into our source code.
*/

import { findDOMNode } from 'react-dom';

const ReactNative = {
  Animated: { createAnimatedComponent: (a: any) => a },
  Easing: null,
  processColor: null,
  StyleSheet: { create: (a: any) => a },
  StyleProp: null,
  ViewStyle: null,
  View: null,
  TouchableHighlightProps: null,
  TouchableOpacityProps: null,
  ColorValue: null,
  ViewProps: null,
  TouchableWithoutFeedbackProps: null,
  Insets: null,
  TouchableNativeFeedback: null,
  ScrollView: null,
  ScrollViewProps: null,
  Switch: null,
  SwitchProps: null,
  TextInput: null,
  TextInputProps: null,
  DrawerLayoutAndroid: null,
  DrawerLayoutAndroidProps: null,
  FlatList: null,
  FlatListProps: null,
  RefreshControl: null,
  I18nManager: { isRTL: false },
  LayoutChangeEvent: null,
  Keyboard: null,
  StatusBar: null,
  StatusBarAnimation: null,
  NativeSyntheticEvent: null,
  PixelRatio: { get: () => window.devicePixelRatio },

  UIManager: null,
  EmitterSubscription: null,
  DeviceEventEmitter: {
    addListener: (_a: string, _b: unknown) => null,
  },
  // @ts-ignore Process is defined, but we don't want to add `node` types.
  isDEV: process.env.NODE_ENV === 'development',
  NativeModules: null,
  Platform: { OS: 'web' },
  findNodeHandle: findDOMNode,
};

export const {
  Animated,
  Easing,
  processColor,
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  TouchableHighlightProps,
  TouchableOpacityProps,
  ColorValue,
  ViewProps,
  TouchableWithoutFeedbackProps,
  Insets,
  TouchableNativeFeedback,
  ScrollView,
  ScrollViewProps,
  Switch,
  SwitchProps,
  TextInput,
  TextInputProps,
  DrawerLayoutAndroid,
  DrawerLayoutAndroidProps,
  FlatList,
  FlatListProps,
  RefreshControl,
  I18nManager,
  LayoutChangeEvent,
  Keyboard,
  StatusBar,
  StatusBarAnimation,
  NativeSyntheticEvent,
  UIManager,
  EmitterSubscription,
  DeviceEventEmitter,
  isDEV,
  NativeModules,
  Platform,
  findNodeHandle,
} = ReactNative;
