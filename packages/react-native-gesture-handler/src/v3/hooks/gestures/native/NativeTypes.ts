import type {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvent,
  SingleGesture,
  WithSharedValue,
} from '../../../types';

export type NativeGestureNativeProperties = {
  /**
   * Android only.
   *
   * Determines whether the handler should check for an existing touch event on
   * instantiation.
   */
  shouldActivateOnStart?: boolean;

  /**
   * When `true`, cancels all other gesture handlers when this
   * `NativeViewGestureHandler` receives an `ACTIVE` state event.
   */
  disallowInterruption?: boolean;

  /**
   * Composes with `disallowInterruption`. When both are `true`, the handler still
   * resists generic gesture peers (Pan, Tap, etc.) but yields to other
   * `NativeViewGestureHandler` peers such as a wrapping ScrollView. No-op when
   * `disallowInterruption` is `false`.
   */
  yieldsToNativeGestures?: boolean;
};

export const NativeHandlerNativeProperties = new Set<
  keyof NativeGestureNativeProperties
>(['shouldActivateOnStart', 'disallowInterruption', 'yieldsToNativeGestures']);

export type NativeHandlerData = {
  pointerInside: boolean;
};

export type NativeGestureProperties =
  WithSharedValue<NativeGestureNativeProperties>;

export type NativeGestureInternalConfig = BaseGestureConfig<
  NativeGestureProperties,
  NativeHandlerData
>;

export type NativeGestureConfig =
  ExcludeInternalConfigProps<NativeGestureInternalConfig>;

export type NativeGestureEvent = GestureEvent<NativeHandlerData>;
export type NativeGestureActiveEvent = NativeGestureEvent;

export type NativeGesture = SingleGesture<
  NativeGestureProperties,
  NativeHandlerData
>;
