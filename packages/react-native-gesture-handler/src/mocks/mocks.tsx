import React from 'react';
import {
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  Switch,
  TextInput,
  TextInputProps,
  DrawerLayoutAndroid,
  DrawerLayoutAndroidProps,
  View,
} from 'react-native';
import { State } from '../State';
import { Directions } from '../Directions';

const NOOP = () => {
  // Do nothing
};
const PanGestureHandler = View;
const attachGestureHandler = NOOP;
const createGestureHandler = NOOP;
const dropGestureHandler = NOOP;
const updateGestureHandler = NOOP;
const flushOperations = NOOP;
const install = NOOP;
const NativeViewGestureHandler = View;
const TapGestureHandler = View;
const ForceTouchGestureHandler = View;
const LongPressGestureHandler = View;
const PinchGestureHandler = View;
const RotationGestureHandler = View;
const FlingGestureHandler = View;
export const RawButton = ({ enabled, children, ...rest }: any) => (
  <TouchableNativeFeedback disabled={enabled === false} {...rest}>
    {children ?? <View />}
  </TouchableNativeFeedback>
);
export const BaseButton = RawButton;
export const RectButton = RawButton;
export const BorderlessButton = TouchableNativeFeedback;

export default {
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  Switch,
  // Explicit types keep the emitted declaration portable under TS 6.
  TextInput: TextInput as React.ComponentType<TextInputProps>,
  DrawerLayoutAndroid:
    DrawerLayoutAndroid as React.ComponentType<DrawerLayoutAndroidProps>,
  NativeViewGestureHandler,
  TapGestureHandler,
  ForceTouchGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
  PanGestureHandler,
  attachGestureHandler,
  createGestureHandler,
  dropGestureHandler,
  updateGestureHandler,
  flushOperations,
  install,
  // Probably can be removed
  Directions,
  State,
} as const;
