import { PinchGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

/**
 * @deprecated PinchGestureHandler will be removed in Gesture Handler 4. Use `Gesture.Pinch()` instead.
 */
export interface PinchGestureHandlerProps
  extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {}

export const pinchHandlerName = 'PinchGestureHandler';

/**
 * @deprecated PinchGestureHandler will be removed in Gesture Handler 4. Use `Gesture.Pinch()` instead.
 */
export type PinchGestureHandler = typeof PinchGestureHandler;

/**
 * @deprecated PinchGestureHandler will be removed in Gesture Handler 4. Use `Gesture.Pinch()` instead.
 */
export const PinchGestureHandler = createHandler<
  PinchGestureHandlerProps,
  PinchGestureHandlerEventPayload
>({
  name: pinchHandlerName,
  allowedProps: baseGestureHandlerProps,
  config: {},
});
