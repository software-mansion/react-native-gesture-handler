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

const NOOP = () => {
  // do nothing
};

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
  NativeViewGestureHandler: View,
  TapGestureHandler: View,
  ForceTouchGestureHandler: View,
  LongPressGestureHandler: View,
  PanGestureHandler: View,
  PinchGestureHandler: View,
  RotationGestureHandler: View,
  FlingGestureHandler: View,
  RawButton: TouchableNativeFeedback,
  BaseButton: TouchableNativeFeedback,
  RectButton: TouchableNativeFeedback,
  BorderlessButton: TouchableNativeFeedback,
  attachGestureHandler: NOOP,
  createGestureHandler: NOOP,
  dropGestureHandler: NOOP,
  updateGestureHandler: NOOP,
  Direction: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
  State: {
    BEGAN: 'BEGAN',
    FAILED: 'FAILED',
    ACTIVE: 'ACTIVE',
    END: 'END',
    UNDETERMINED: 'UNDETERMINED',
  },
};
