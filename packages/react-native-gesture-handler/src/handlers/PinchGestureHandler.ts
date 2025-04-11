import { PinchGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

/**
 * @deprecated PinchGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Pinch()` instead.
 */
export interface PinchGestureHandlerProps
  extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {}

export const pinchHandlerName = 'PinchGestureHandler';

/**
 * @deprecated PinchGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Pinch()` instead.
 */
export type PinchGestureHandler = typeof PinchGestureHandler;

/**
 * @deprecated PinchGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Pinch()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const PinchGestureHandler = createHandler<
  PinchGestureHandlerProps,
  PinchGestureHandlerEventPayload
>({
  name: pinchHandlerName,
  allowedProps: baseGestureHandlerProps,
  config: {},
});
