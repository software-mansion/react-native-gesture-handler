// The react-native platform binding of the gesture-handler core. Every
// export is bound to the shared runtime (see ./binding/runtime.ts) in its
// own module — the same wiring pattern as the react-gesture-handler
// package. This barrel keeps the historical import path stable for the
// package's internal consumers and the byte-compat stubs.
export {
  useCompetingGestures,
  useComposedGesture,
  useExclusiveGestures,
  useSimultaneousGestures,
} from './binding/composition';
export { createNativeWrapper } from './binding/createNativeWrapper';
export { InterceptingGestureDetector } from './binding/InterceptingGestureDetector';
export { NativeDetector } from './binding/NativeDetector';
export {
  useEnsureGestureHandlerRootView,
  useGestureCallbacks,
  useGestureRelationsUpdater,
  useJSResponderHandler,
} from './binding/supporting';
export { Touchable } from './binding/Touchable';
export { useFlingGesture } from './binding/useFlingGesture';
export { useGesture } from './binding/useGesture';
export { useHoverGesture } from './binding/useHoverGesture';
export { useLongPressGesture } from './binding/useLongPressGesture';
export { useManualGesture } from './binding/useManualGesture';
export { useNativeGesture } from './binding/useNativeGesture';
export { usePanGesture } from './binding/usePanGesture';
export { usePinchGesture } from './binding/usePinchGesture';
export { useRotationGesture } from './binding/useRotationGesture';
export { useTapGesture } from './binding/useTapGesture';
export {
  VirtualDetector,
  VirtualDetector as VirtualGestureDetector,
} from './binding/VirtualDetector';
