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
const NativeDetector = View;
const InterceptingDetector = View;

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
  configureRelations,
  flushOperations,
  install,
  NativeDetector,
  InterceptingDetector,
  // Probably can be removed
  Directions,
  State,
} as const;
