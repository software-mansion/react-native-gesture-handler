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

export const nativeViewProperties = [
  ...baseProperties,
  'shouldActivateOnStart',
  'disallowInterruption',
] as const;

const NativeViewGestureHandler = createHandler<
  NativeViewGestureHandlerProperties,
  NativeViewGestureHandlerPayload
>({
  name: 'NativeViewGestureHandler',
  allowedProps: nativeViewProperties,
  config: {},
});

export default NativeViewGestureHandler;
