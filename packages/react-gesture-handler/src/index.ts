// Curated v3-only barrel of the plain React DOM gesture-handler binding (PoC).
export {
  // On the DOM binding there is no legacy API, so GestureDetector IS the
  // core NativeDetector (no instanceof switcher).
  NativeDetector as GestureDetector,
  GestureStateManager,
  InterceptingGestureDetector,
  useCompetingGestures,
  useExclusiveGestures,
  useFlingGesture,
  useGesture,
  useHoverGesture,
  useLongPressGesture,
  useManualGesture,
  useNativeGesture,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
  VirtualDetector as VirtualGestureDetector,
} from './binding';
export type { TouchableProps } from './Touchable';
export { Touchable } from './Touchable';
export {
  ActionType,
  Directions,
  HoverEffect,
  MouseButton,
  PointerType,
  State,
  TouchEventType,
} from '@swmansion/gesture-handler-core';
export type {
  FlingGesture,
  FlingGestureConfig,
  HoverGesture,
  HoverGestureConfig,
  LongPressGesture,
  LongPressGestureConfig,
  ManualGesture,
  ManualGestureConfig,
  NativeGesture,
  NativeGestureConfig,
  PanGesture,
  PanGestureConfig,
  PinchGesture,
  PinchGestureConfig,
  RotationGesture,
  RotationGestureConfig,
  SingleGesture,
  TapGesture,
  TapGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
export type {
  AnimationDuration,
  TouchableBehaviorProps,
  TouchableButtonProps,
} from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';
