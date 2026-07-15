// Curated v3-only barrel of the plain React DOM gesture-handler binding (PoC).
import type {
  BaseGestureConfig,
  SingleGesture,
  SingleGestureName,
} from '@swmansion/gesture-handler-core';
import type {
  FlingGesture,
  FlingGestureConfig as CoreFlingGestureConfig,
  HoverGesture,
  HoverGestureConfig as CoreHoverGestureConfig,
  LongPressGesture,
  LongPressGestureConfig as CoreLongPressGestureConfig,
  ManualGesture,
  ManualGestureConfig as CoreManualGestureConfig,
  NativeGesture,
  NativeGestureConfig as CoreNativeGestureConfig,
  PanGesture,
  PanGestureConfig as CorePanGestureConfig,
  PinchGesture,
  PinchGestureConfig as CorePinchGestureConfig,
  RotationGesture,
  RotationGestureConfig as CoreRotationGestureConfig,
  TapGesture,
  TapGestureConfig as CoreTapGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';

import * as binding from './binding';

// This binding has no reanimated (there is no react-native runtime), so the
// shared config types' `SharedValue` unions are stripped at this boundary —
// the public API of this package must not advertise reanimated concepts.
// Same overlay pattern as Touchable: core keeps one config type, each
// platform re-exports it under its precise public shape.
export type FlingGestureConfig = WithoutSharedValues<CoreFlingGestureConfig>;
export type HoverGestureConfig = WithoutSharedValues<CoreHoverGestureConfig>;
export type LongPressGestureConfig =
  WithoutSharedValues<CoreLongPressGestureConfig>;
export type ManualGestureConfig = WithoutSharedValues<CoreManualGestureConfig>;
export type NativeGestureConfig = WithoutSharedValues<CoreNativeGestureConfig>;
export type PanGestureConfig = WithoutSharedValues<CorePanGestureConfig>;
export type PinchGestureConfig = WithoutSharedValues<CorePinchGestureConfig>;
export type RotationGestureConfig =
  WithoutSharedValues<CoreRotationGestureConfig>;
export type TapGestureConfig = WithoutSharedValues<CoreTapGestureConfig>;

export const useFlingGesture = binding.useFlingGesture as (
  config?: FlingGestureConfig
) => FlingGesture;
export const useHoverGesture = binding.useHoverGesture as (
  config?: HoverGestureConfig
) => HoverGesture;
export const useLongPressGesture = binding.useLongPressGesture as (
  config?: LongPressGestureConfig
) => LongPressGesture;
export const useManualGesture = binding.useManualGesture as (
  config?: ManualGestureConfig
) => ManualGesture;
export const useNativeGesture = binding.useNativeGesture as (
  config?: NativeGestureConfig
) => NativeGesture;
export const usePanGesture = binding.usePanGesture as (
  config?: PanGestureConfig
) => PanGesture;
export const usePinchGesture = binding.usePinchGesture as (
  config?: PinchGestureConfig
) => PinchGesture;
export const useRotationGesture = binding.useRotationGesture as (
  config?: RotationGestureConfig
) => RotationGesture;
export const useTapGesture = binding.useTapGesture as (
  config?: TapGestureConfig
) => TapGesture;
export const useGesture = binding.useGesture as <
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
>(
  type: SingleGestureName,
  config: WithoutSharedValues<
    BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  >
) => SingleGesture<TConfig, THandlerData, TExtendedHandlerData>;

export {
  // On the DOM binding there is no legacy API, so GestureDetector IS the
  // core NativeDetector (no instanceof switcher).
  NativeDetector as GestureDetector,
  GestureStateManager,
  InterceptingGestureDetector,
  useCompetingGestures,
  useExclusiveGestures,
  useSimultaneousGestures,
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
