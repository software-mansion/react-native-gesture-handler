import { View } from 'react-native';

const NOOP = () => {
  // Do nothing
};

const attachGestureHandler = NOOP;
const createGestureHandler = NOOP;
const dropGestureHandler = NOOP;
const setGestureHandlerConfig = NOOP;
const updateGestureHandlerConfig = NOOP;
const flushOperations = NOOP;
const configureRelations = NOOP;
const install = NOOP;

const PanGestureHandler = View;
const NativeViewGestureHandler = View;
const TapGestureHandler = View;
const ForceTouchGestureHandler = View;
const LongPressGestureHandler = View;
const PinchGestureHandler = View;
const RotationGestureHandler = View;
const FlingGestureHandler = View;

export default {
  attachGestureHandler,
  createGestureHandler,
  dropGestureHandler,
  setGestureHandlerConfig,
  updateGestureHandlerConfig,
  configureRelations,
  flushOperations,
  install,
  NativeViewGestureHandler,
  TapGestureHandler,
  ForceTouchGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
  PanGestureHandler,
} as const;
