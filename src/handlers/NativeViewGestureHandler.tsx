import createHandler from './createHandler';
import GestureHandlerPropTypes from '../GestureHandlerPropTypes';

const NativeViewGestureHandler = createHandler('NativeViewGestureHandler', {
  ...GestureHandlerPropTypes,

  // If changed, add changes to NATIVE_WRAPPER_PROPS_FILTER as well
  boolean,
  boolean,
});

export default NativeViewGestureHandler;
