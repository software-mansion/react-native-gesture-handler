import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export type RotationGestureHandlerEventPayload = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
};

export interface RotationGestureHandlerProps
  extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload> {}

export type RotationGestureHandler = typeof RotationGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const RotationGestureHandler = createHandler<
  RotationGestureHandlerProps,
  RotationGestureHandlerEventPayload
>({
  name: 'RotationGestureHandler',
  allowedProps: baseGestureHandlerProps,
  config: {},
});
