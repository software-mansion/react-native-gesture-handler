import { RotationGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import { BaseGestureHandlerProps } from './gestureHandlerCommon';

/**
 * @deprecated RotationGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Rotation()` instead.
 */
export interface RotationGestureHandlerProps
  extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload> {}

export const rotationHandlerName = 'RotationGestureHandler';
