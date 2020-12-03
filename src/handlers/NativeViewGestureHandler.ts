// @ts-nocheck
import createHandler from './createHandler';
import { BaseGestureHandlerProperties } from './Gestures';
const props: BaseGestureHandlerProperties = {};

const NativeViewGestureHandler = createHandler('NativeViewGestureHandler', {
  ...props,

  // If changed, add changes to NATIVE_WRAPPER_PROPS_FILTER as well
  boolean,
});

export default NativeViewGestureHandler;
