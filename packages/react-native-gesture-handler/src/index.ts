import './globals';

import { initialize } from './init';

export {
  LegacyBaseButton,
  LegacyBorderlessButton,
  LegacyRawButton,
  LegacyRectButton,
} from './components/GestureButtons';
export type {
  LegacyBaseButtonProps,
  LegacyBorderlessButtonProps,
  LegacyRawButtonProps,
  LegacyRectButtonProps,
} from './components/GestureButtonsProps';
export {
  LegacyDrawerLayoutAndroid,
  LegacyFlatList,
  LegacyRefreshControl,
  LegacyScrollView,
  LegacySwitch,
  LegacyTextInput,
} from './components/GestureComponents';
export { default as GestureHandlerRootView } from './components/GestureHandlerRootView';
export type {
  LegacyPressableProps,
  PressableProps,
  PressableStateCallbackType,
} from './components/Pressable';
export { default as LegacyPressable } from './components/Pressable';
export { LegacyText } from './components/Text';
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
export { Directions } from './Directions';
export { default as legacy_createNativeWrapper } from './handlers/createNativeWrapper';
export type { FlingGestureHandlerProps } from './handlers/FlingGestureHandler';
export { FlingGestureHandler } from './handlers/FlingGestureHandler';
export type { ForceTouchGestureHandlerProps } from './handlers/ForceTouchGestureHandler';
export { ForceTouchGestureHandler } from './handlers/ForceTouchGestureHandler';
export type {
  // Config types
  ActiveCursor,
  // Event types
  GestureEvent,
  // Event payloads types
  GestureEventPayload,
  GestureStateChangeEvent,
  // Pointer events
  GestureTouchEvent,
  // New api event types
  GestureUpdateEvent,
  HandlerStateChangeEvent,
  HandlerStateChangeEventPayload,
  GestureTouchEvent as SingleGestureTouchEvent,
  TouchData,
} from './handlers/gestureHandlerCommon';
export { MouseButton } from './handlers/gestureHandlerCommon';
export type {
  FlingGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
  NativeViewGestureHandlerPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from './handlers/GestureHandlerEventPayload';
export type {
  FlingGestureHandlerGestureEvent,
  FlingGestureHandlerProperties,
  FlingGestureHandlerStateChangeEvent,
  ForceTouchGestureHandlerGestureEvent,
  ForceTouchGestureHandlerProperties,
  ForceTouchGestureHandlerStateChangeEvent,
  // Events
  GestureHandlerGestureEvent,
  // Event payloads
  GestureHandlerGestureEventNativeEvent,
  GestureHandlerStateChangeEvent,
  GestureHandlerStateChangeNativeEvent,
  LegacyBaseButtonProperties,
  LegacyBorderlessButtonProperties,
  // Buttons props
  LegacyRawButtonProperties,
  LegacyRectButtonProperties,
  LongPressGestureHandlerGestureEvent,
  LongPressGestureHandlerProperties,
  LongPressGestureHandlerStateChangeEvent,
  NativeViewGestureHandlerGestureEvent,
  // Handlers props
  NativeViewGestureHandlerProperties,
  NativeViewGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerProperties,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandlerGestureEvent,
  PinchGestureHandlerProperties,
  PinchGestureHandlerStateChangeEvent,
  RotationGestureHandlerGestureEvent,
  RotationGestureHandlerProperties,
  RotationGestureHandlerStateChangeEvent,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerProperties,
  TapGestureHandlerStateChangeEvent,
} from './handlers/gestureHandlerTypesCompat';
export type { FlingGestureType as LegacyFlingGesture } from './handlers/gestures/flingGesture';
export type { ForceTouchGestureChangeEventPayload } from './handlers/gestures/forceTouchGesture';
export type { ForceTouchGestureType as LegacyForceTouchGesture } from './handlers/gestures/forceTouchGesture';
export type { GestureType } from './handlers/gestures/gesture';
export type {
  ComposedGestureType as LegacyComposedGesture,
  ExclusiveGestureType as LegacyExclusiveGesture,
  RaceGestureType as LegacyRaceGesture,
  SimultaneousGestureType as LegacySimultaneousGesture,
} from './handlers/gestures/gestureComposition';
export { GestureObjects as Gesture } from './handlers/gestures/gestureObjects';
export type { GestureStateManagerType as LegacyGestureStateManager } from './handlers/gestures/gestureStateManager';
export type { HoverGestureType as LegacyHoverGesture } from './handlers/gestures/hoverGesture';
export { HoverEffect } from './handlers/gestures/hoverGesture';
export type { LongPressGestureType as LegacyLongPressGesture } from './handlers/gestures/longPressGesture';
export type { ManualGestureType as LegacyManualGesture } from './handlers/gestures/manualGesture';
export type { PanGestureChangeEventPayload } from './handlers/gestures/panGesture';
export type { PanGestureType as LegacyPanGesture } from './handlers/gestures/panGesture';
export type { PinchGestureChangeEventPayload } from './handlers/gestures/pinchGesture';
export type { PinchGestureType as LegacyPinchGesture } from './handlers/gestures/pinchGesture';
export type { RotationGestureType as LegacyRotationGesture } from './handlers/gestures/rotationGesture';
export type { TapGestureType as LegacyTapGesture } from './handlers/gestures/tapGesture';
export type { LongPressGestureHandlerProps } from './handlers/LongPressGestureHandler';
export { LongPressGestureHandler } from './handlers/LongPressGestureHandler';
export type { NativeViewGestureHandlerProps } from './handlers/NativeViewGestureHandler';
export { NativeViewGestureHandler } from './handlers/NativeViewGestureHandler';
export type { PanGestureHandlerProps } from './handlers/PanGestureHandler';
export { PanGestureHandler } from './handlers/PanGestureHandler';
export type { PinchGestureHandlerProps } from './handlers/PinchGestureHandler';
export { PinchGestureHandler } from './handlers/PinchGestureHandler';
export type { RotationGestureHandlerProps } from './handlers/RotationGestureHandler';
export { RotationGestureHandler } from './handlers/RotationGestureHandler';
export type { TapGestureHandlerProps } from './handlers/TapGestureHandler';
export { TapGestureHandler } from './handlers/TapGestureHandler';
export { PointerType } from './PointerType';
export { State } from './State';
export * from './v3';

initialize();
