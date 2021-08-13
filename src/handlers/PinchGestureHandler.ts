import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export type PinchGestureHandlerEventPayload = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
};

export interface PinchGestureHandlerProps
  extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {}

export type PinchGestureHandler = typeof PinchGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const PinchGestureHandler = createHandler<
  PinchGestureHandlerProps,
  PinchGestureHandlerEventPayload
>({
  name: 'PinchGestureHandler',
  allowedProps: baseGestureHandlerProps,
  config: {},
});
