import createHandler from './createHandler';
import {
  BaseGestureHandlerProperties,
  baseProperties,
} from './gestureHandlers';

export interface NativeViewGestureHandlerProperties
  extends BaseGestureHandlerProperties<NativeViewGestureHandlerPayload> {
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
}

export type NativeViewGestureHandlerPayload = {
  pointerInside: boolean;
};

const NativeViewGestureHandler = createHandler<
  NativeViewGestureHandlerProperties,
  NativeViewGestureHandlerPayload
>({
  name: 'NativeViewGestureHandler',
  allowedProps: [
    ...baseProperties,
    'shouldActivateOnStart',
    'disallowInterruption',
  ] as const,
  config: {},
});

export default NativeViewGestureHandler;
