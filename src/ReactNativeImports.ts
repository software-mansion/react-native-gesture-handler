// const ReactNativeStr = 'react-native';
let ReactNative = {
  Animated: { createAnimatedComponent: ({}) => {} },
  Easing: null,
  processColor: null,
  StyleSheet: { create: ({}) => {} },
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
};

export const Animated = ReactNative.Animated;
export const Easing = ReactNative.Easing;
export const processColor = ReactNative.processColor;
export const StyleSheet = ReactNative.StyleSheet;
export type StyleProp = typeof ReactNative.StyleProp;
export type ViewStyle = typeof ReactNative.ViewStyle;
export const View = ReactNative.View;
export type TouchableHighlightProps =
  typeof ReactNative.TouchableHighlightProps;
export type TouchableOpacityProps = typeof ReactNative.TouchableOpacityProps;
export type ColorValue = typeof ReactNative.ColorValue;
export type ViewProps = typeof ReactNative.ViewProps;
export const TouchableWithoutFeedbackProps =
  ReactNative.TouchableWithoutFeedbackProps;
export const Insets = ReactNative.Insets;
export const TouchableNativeFeedback = ReactNative.TouchableNativeFeedback;
export const ScrollView = ReactNative.ScrollView;
export type ScrollViewProps = typeof ReactNative.ScrollViewProps;
export const Switch = ReactNative.Switch;
export type SwitchProps = typeof ReactNative.SwitchProps;
export const TextInput = ReactNative.TextInput;
export type TextInputProps = typeof ReactNative.TextInputProps;
export const DrawerLayoutAndroid = ReactNative.DrawerLayoutAndroid;
export type DrawerLayoutAndroidProps =
  typeof ReactNative.DrawerLayoutAndroidProps;
export const FlatList = ReactNative.FlatList;
export type FlatListProps = typeof ReactNative.FlatListProps;
export const RefreshControl = ReactNative.RefreshControl;
export const I18nManager = ReactNative.I18nManager;
export const LayoutChangeEvent = ReactNative.LayoutChangeEvent;
export const Keyboard = ReactNative.Keyboard;
export const StatusBar = ReactNative.StatusBar;
export const StatusBarAnimation = ReactNative.StatusBarAnimation;
export const NativeSyntheticEvent = ReactNative.NativeSyntheticEvent;
