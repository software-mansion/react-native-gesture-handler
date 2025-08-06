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
  DrawerLayoutAndroid,
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
const setGestureHandlerConfig = NOOP;
const updateGestureHandlerConfig = NOOP;
const flushOperations = NOOP;
const install = NOOP;
const NativeViewGestureHandler = View;
const TapGestureHandler = View;
const ForceTouchGestureHandler = View;
const LongPressGestureHandler = View;
const PinchGestureHandler = View;
const RotationGestureHandler = View;
const FlingGestureHandler = View;
export const RawButton = ({ enabled, ...rest }: any) => (
  <TouchableNativeFeedback disabled={enabled === false} {...rest}>
    <View />
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
  TextInput,
  DrawerLayoutAndroid,
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
  setGestureHandlerConfig,
  updateGestureHandlerConfig,
  flushOperations,
  install,
  // Probably can be removed
  Directions,
  State,
} as const;
