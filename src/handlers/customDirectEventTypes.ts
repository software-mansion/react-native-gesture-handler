// @ts-ignore - its taken straight from RN
import { customDirectEventTypes } from 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';

customDirectEventTypes.topGestureHandlerEvent = {
  registrationName: 'onGestureHandlerEvent',
};

export default customDirectEventTypes;
