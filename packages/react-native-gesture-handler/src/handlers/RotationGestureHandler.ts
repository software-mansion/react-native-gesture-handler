import createHandler from './createHandler';
import type { BaseGestureHandlerProps } from './gestureHandlerCommon';
import { baseGestureHandlerProps } from './gestureHandlerCommon';
import type { RotationGestureHandlerEventPayload } from './GestureHandlerEventPayload';

/**
 * @deprecated RotationGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Rotation()` instead.
 */
export interface RotationGestureHandlerProps
  extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload> {}

export const rotationHandlerName = 'RotationGestureHandler';

/**
 * @deprecated RotationGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Rotation()` instead.
 */
export type RotationGestureHandler = typeof RotationGestureHandler;

/**
 * @deprecated RotationGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Rotation()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const RotationGestureHandler = createHandler<
  RotationGestureHandlerProps,
  RotationGestureHandlerEventPayload
>({
  name: rotationHandlerName,
  allowedProps: baseGestureHandlerProps,
  config: {},
});
