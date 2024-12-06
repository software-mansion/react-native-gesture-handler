import type { NativeViewGestureHandlerPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
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
 * @deprecated Gesture Handler old API will be removed in Gesture Handler 4. Use `Gesture.Native()` instead.
 */
export interface NativeViewGestureHandlerProps
  extends BaseGestureHandlerProps<NativeViewGestureHandlerPayload>,
    NativeViewGestureConfig {}

export const nativeViewProps = [
  ...baseGestureHandlerProps,
  ...nativeViewGestureHandlerProps,
] as const;

export const nativeViewHandlerName = 'NativeViewGestureHandler';

/**
 * @deprecated Gesture Handler old API will be removed in Gesture Handler 4. Use `Gesture.Native()` instead.
 */
export type NativeViewGestureHandler = typeof NativeViewGestureHandler;

/**
 * @deprecated Gesture Handler old API will be removed in Gesture Handler 4. Use `Gesture.Native()` instead.
 */
export const NativeViewGestureHandler = createHandler<
  NativeViewGestureHandlerProps,
  NativeViewGestureHandlerPayload
>({
  name: nativeViewHandlerName,
  allowedProps: nativeViewProps,
  config: {},
});
