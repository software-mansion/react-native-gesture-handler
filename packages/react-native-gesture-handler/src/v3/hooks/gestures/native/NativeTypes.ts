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
};

export const NativeHandlerNativeProperties = new Set<
  keyof NativeGestureNativeProperties
>([
  'shouldActivateOnStart',
  'disallowInterruption',
  'yieldsToContinuousGestures',
]);

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
