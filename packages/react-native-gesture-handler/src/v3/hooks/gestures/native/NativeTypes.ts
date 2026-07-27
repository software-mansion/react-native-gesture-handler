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
   * resists discrete gestures but yields to continuous gestures, so a wrapping
   * gesture can take over the touch stream. No-op when `disallowInterruption` is
   * `false`.
   */
  yieldsToContinuousGestures?: boolean;

  /**
   * When `true`, the wrapped scrollable container delays displaying the
   * pressed state of its children until it's clear that the gesture is not a
   * scroll. Set it to `false` to display the pressed state immediately.
   *
   * On iOS this controls `delaysContentTouches` on the underlying
   * `UIScrollView`. On Android it controls whether the container delays the
   * pressed state of its children (see
   * `ViewGroup.shouldDelayChildPressedState`) — this requires React Native
   * 0.87 or newer and is a no-op on older versions.
   *
   * Defaults to `true`.
   */
  delaysChildPressedState?: boolean;
};

export const NativeHandlerNativeProperties = new Set<
  keyof NativeGestureNativeProperties
>([
  'shouldActivateOnStart',
  'disallowInterruption',
  'yieldsToContinuousGestures',
  'delaysChildPressedState',
]);

export type NativeHandlerData = {
  pointerInside: boolean;
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
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
