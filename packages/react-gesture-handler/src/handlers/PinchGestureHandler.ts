import { PinchGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import { BaseGestureHandlerProps } from './gestureHandlerCommon';

/**
 * @deprecated PinchGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Pinch()` instead.
 */
export interface PinchGestureHandlerProps
  extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {}

export const pinchHandlerName = 'PinchGestureHandler';
