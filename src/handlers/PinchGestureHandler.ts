import { PinchGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export interface PinchGestureHandlerProps
  extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {}

export const pinchHandlerName = 'PinchGestureHandler';

export type PinchGestureHandler = typeof PinchGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const PinchGestureHandler = createHandler<
  PinchGestureHandlerProps,
  PinchGestureHandlerEventPayload
>({
  name: pinchHandlerName,
  allowedProps: baseGestureHandlerProps,
  config: {},
});
