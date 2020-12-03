// @ts-nocheck
import createHandler from './createHandler';
import { BaseGestureHandlerProperties } from './gestureHandlers';
const props: BaseGestureHandlerProperties = {};

export interface NativeViewGestureHandlerProperties
  extends BaseGestureHandlerProperties<NativeViewGestureHandlerPayload> {
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
}
export interface NativeViewGestureHandlerPayload {
  pointerInside: boolean;
}

const NativeViewGestureHandler = createHandler('NativeViewGestureHandler', {
  ...props,

  // If changed, add changes to NATIVE_WRAPPER_PROPS_FILTER as well
  boolean,
});

export default NativeViewGestureHandler;
