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
};

export const NativeHandlerNativeProperties = new Set<
  keyof NativeGestureNativeProperties
>(['shouldActivateOnStart', 'disallowInterruption']);
