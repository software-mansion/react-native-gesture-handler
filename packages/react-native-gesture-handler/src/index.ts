import './globals';

import { initialize } from './init';

export { Directions } from './Directions';
export { State } from './State';
export { PointerType } from './PointerType';
export { default as gestureHandlerRootHOC } from './components/gestureHandlerRootHOC';
export { default as GestureHandlerRootView } from './components/GestureHandlerRootView';
export type {
  // Event types
  GestureEvent,
  HandlerStateChangeEvent,
  // Event payloads types
  GestureEventPayload,
  HandlerStateChangeEventPayload,
  // Pointer events
  GestureTouchEvent,
  TouchData,
  // New api event types
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from './handlers/gestureHandlerCommon';
export { MouseButton } from './handlers/gestureHandlerCommon';
export type { GestureType } from './handlers/gestures/gesture';
export type {
  TapGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  NativeViewGestureHandlerPayload,
  FlingGestureHandlerEventPayload,
} from './handlers/GestureHandlerEventPayload';
export type { TapGestureHandlerProps } from './handlers/TapGestureHandler';
export type { ForceTouchGestureHandlerProps } from './handlers/ForceTouchGestureHandler';
export type { ForceTouchGestureChangeEventPayload } from './handlers/gestures/forceTouchGesture';
export type { LongPressGestureHandlerProps } from './handlers/LongPressGestureHandler';
export type { PanGestureHandlerProps } from './handlers/PanGestureHandler';
export type { PanGestureChangeEventPayload } from './handlers/gestures/panGesture';
export type { PinchGestureHandlerProps } from './handlers/PinchGestureHandler';
export type { PinchGestureChangeEventPayload } from './handlers/gestures/pinchGesture';
export type { RotationGestureHandlerProps } from './handlers/RotationGestureHandler';
export type { FlingGestureHandlerProps } from './handlers/FlingGestureHandler';
export { TapGestureHandler } from './handlers/TapGestureHandler';
export { ForceTouchGestureHandler } from './handlers/ForceTouchGestureHandler';
export { LongPressGestureHandler } from './handlers/LongPressGestureHandler';
export { PanGestureHandler } from './handlers/PanGestureHandler';
export { PinchGestureHandler } from './handlers/PinchGestureHandler';
export { RotationGestureHandler } from './handlers/RotationGestureHandler';
export { FlingGestureHandler } from './handlers/FlingGestureHandler';
export { default as createNativeWrapper } from './handlers/createNativeWrapper';
export type { NativeViewGestureHandlerProps } from './handlers/NativeViewGestureHandler';
export { GestureDetector } from './handlers/gestures/GestureDetector';
export { GestureObjects as Gesture } from './handlers/gestures/gestureObjects';
export type { TapGestureType as TapGesture } from './handlers/gestures/tapGesture';
export type { PanGestureType as PanGesture } from './handlers/gestures/panGesture';
export type { FlingGestureType as FlingGesture } from './handlers/gestures/flingGesture';
export type { LongPressGestureType as LongPressGesture } from './handlers/gestures/longPressGesture';
export type { PinchGestureType as PinchGesture } from './handlers/gestures/pinchGesture';
export type { RotationGestureType as RotationGesture } from './handlers/gestures/rotationGesture';
export type { ForceTouchGestureType as ForceTouchGesture } from './handlers/gestures/forceTouchGesture';
export type { ManualGestureType as ManualGesture } from './handlers/gestures/manualGesture';
export type { HoverGestureType as HoverGesture } from './handlers/gestures/hoverGesture';
export type {
  ComposedGestureType as ComposedGesture,
  RaceGestureType as RaceGesture,
  SimultaneousGestureType as SimultaneousGesture,
  ExclusiveGestureType as ExclusiveGesture,
} from './handlers/gestures/gestureComposition';
export type { GestureStateManagerType as GestureStateManager } from './handlers/gestures/gestureStateManager';
export { NativeViewGestureHandler } from './handlers/NativeViewGestureHandler';
export type {
  RawButtonProps,
  BaseButtonProps,
  RectButtonProps,
  BorderlessButtonProps,
} from './components/GestureButtonsProps';
export {
  RawButton,
  BaseButton,
  RectButton,
  BorderlessButton,
  PureNativeButton,
} from './components/GestureButtons';
export type {
  TouchableHighlightProps,
  TouchableOpacityProps,
  TouchableWithoutFeedbackProps,
} from './components/touchables';
export {
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from './components/touchables';
export {
  ScrollView,
  Switch,
  TextInput,
  DrawerLayoutAndroid,
  FlatList,
  RefreshControl,
} from './components/GestureComponents';
export { Text } from './components/Text';
export { HoverEffect } from './handlers/gestures/hoverGesture';
export type {
  // Events
  GestureHandlerGestureEvent,
  GestureHandlerStateChangeEvent,
  // Event payloads
  GestureHandlerGestureEventNativeEvent,
  GestureHandlerStateChangeNativeEvent,
  NativeViewGestureHandlerGestureEvent,
  NativeViewGestureHandlerStateChangeEvent,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
  ForceTouchGestureHandlerGestureEvent,
  ForceTouchGestureHandlerStateChangeEvent,
  LongPressGestureHandlerGestureEvent,
  LongPressGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandlerGestureEvent,
  PinchGestureHandlerStateChangeEvent,
  RotationGestureHandlerGestureEvent,
  RotationGestureHandlerStateChangeEvent,
  FlingGestureHandlerGestureEvent,
  FlingGestureHandlerStateChangeEvent,
  // Handlers props
  NativeViewGestureHandlerProperties,
  TapGestureHandlerProperties,
  LongPressGestureHandlerProperties,
  PanGestureHandlerProperties,
  PinchGestureHandlerProperties,
  RotationGestureHandlerProperties,
  FlingGestureHandlerProperties,
  ForceTouchGestureHandlerProperties,
  // Buttons props
  RawButtonProperties,
  BaseButtonProperties,
  RectButtonProperties,
  BorderlessButtonProperties,
} from './handlers/gestureHandlerTypesCompat';

export type { SwipeableProps } from './components/Swipeable';
export { default as Swipeable } from './components/Swipeable';
export type {
  PressableProps,
  PressableStateCallbackType,
} from './components/Pressable';
export { default as Pressable } from './components/Pressable';

export type {
  DrawerLayoutProps,
  DrawerPosition,
  DrawerState,
  DrawerType,
  DrawerLockMode,
  DrawerKeyboardDismissMode,
} from './components/DrawerLayout';
export { default as DrawerLayout } from './components/DrawerLayout';

export type { NativeDetectorProps } from './v3/Detectors/NativeDetector';
export { NativeDetector } from './v3/Detectors/NativeDetector';

export { LogicDetector } from './v3/Detectors/LogicDetector/LogicDetector';
export { DelegateDetector } from './v3/Detectors/LogicDetector/DelegateDetector';

export * from './v3/hooks/useGesture';
export * from './v3/hooks/relations';

export { SingleGestureName } from './v3/types';

export * from './v3/hooks/gestures';

initialize();
