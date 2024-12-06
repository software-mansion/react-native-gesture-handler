import { RotationGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

/**
 * @deprecated RotationGestureHandler will be removed in Gesture Handler 4. Use `Gesture.Rotation()` instead.
 */
export interface RotationGestureHandlerProps
  extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload> {}

export const rotationHandlerName = 'RotationGestureHandler';

/**
 * @deprecated RotationGestureHandler will be removed in Gesture Handler 4. Use `Gesture.Rotation()` instead.
 */
export type RotationGestureHandler = typeof RotationGestureHandler;

/**
 * @deprecated RotationGestureHandler will be removed in Gesture Handler 4. Use `Gesture.Rotation()` instead.
 */
export const RotationGestureHandler = createHandler<
  RotationGestureHandlerProps,
  RotationGestureHandlerEventPayload
>({
  name: rotationHandlerName,
  allowedProps: baseGestureHandlerProps,
  config: {},
});
