import type { NativeViewGestureHandlerPayload } from './GestureHandlerEventPayload';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const nativeViewGestureHandlerProps = [
  'shouldActivateOnStart',
  'disallowInterruption',
] as const;

export interface NativeViewGestureConfig {
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
}

/**
 * @deprecated NativeViewGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Native()` instead.
 */
export interface NativeViewGestureHandlerProps
  extends BaseGestureHandlerProps<NativeViewGestureHandlerPayload>,
    NativeViewGestureConfig {}

export const nativeViewProps = [
  ...baseGestureHandlerProps,
  ...nativeViewGestureHandlerProps,
] as const;

export const nativeViewHandlerName = 'NativeViewGestureHandler';
