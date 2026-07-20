// Curated v3-only barrel of the plain React DOM gesture-handler binding
// (PoC). Every export is bound to the shared runtime in its OWN module and
// registers exactly the engine recognizer it needs, so a tree-shaken bundle
// retains only what it imports.
//
// MUST stay the first statement: core/engine modules in the re-export chains
// below read __DEV__ at module scope, and import sorting puts package
// specifiers before './runtime' inside each module — only a barrel-level
// side-effect import evaluates before all of them.
import './ensureDevGlobal';

export { GestureDetector } from './GestureDetector';
export {
  useCompetingGestures,
  useExclusiveGestures,
  useSimultaneousGestures,
} from './gestures/composition';
export type { FlingGestureConfig } from './gestures/useFlingGesture';
export { useFlingGesture } from './gestures/useFlingGesture';
export { useGesture } from './gestures/useGesture';
export type { HoverGestureConfig } from './gestures/useHoverGesture';
export { useHoverGesture } from './gestures/useHoverGesture';
export type { LongPressGestureConfig } from './gestures/useLongPressGesture';
export { useLongPressGesture } from './gestures/useLongPressGesture';
export type { ManualGestureConfig } from './gestures/useManualGesture';
export { useManualGesture } from './gestures/useManualGesture';
export type { NativeGestureConfig } from './gestures/useNativeGesture';
export { useNativeGesture } from './gestures/useNativeGesture';
export type { PanGestureConfig } from './gestures/usePanGesture';
export { usePanGesture } from './gestures/usePanGesture';
export type { PinchGestureConfig } from './gestures/usePinchGesture';
export { usePinchGesture } from './gestures/usePinchGesture';
export type { RotationGestureConfig } from './gestures/useRotationGesture';
export { useRotationGesture } from './gestures/useRotationGesture';
export type { TapGestureConfig } from './gestures/useTapGesture';
export { useTapGesture } from './gestures/useTapGesture';
export { GestureStateManager } from './gestureStateManager';
export { InterceptingGestureDetector } from './InterceptingGestureDetector';
export type { TouchableProps } from './Touchable';
export { Touchable } from './Touchable';
export { VirtualGestureDetector } from './VirtualGestureDetector';
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
  HoverGesture,
  LongPressGesture,
  ManualGesture,
  NativeGesture,
  PanGesture,
  PinchGesture,
  RotationGesture,
  SingleGesture,
  TapGesture,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
export type {
  AnimationDuration,
  TouchableBehaviorProps,
  TouchableButtonProps,
} from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';
