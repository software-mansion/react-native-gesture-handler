import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Int32,
  DirectEventHandler,
  UnsafeMixed,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from 'react-native';

type GestureHandlerEvent = Readonly<{
  handlerTag: Int32;
  state: Int32;
  handlerData: UnsafeMixed;
}>;

type GestureHandlerStateChangeEvent = Readonly<{
  handlerTag: Int32;
  state: Int32;
  oldState: Int32;
  handlerData: UnsafeMixed;
}>;

type GestureHandlerTouchEvent = Readonly<{
  handlerTag: Int32;
  numberOfTouches: Int32;
  state: Int32;
  eventType: Int32;
  allTouches: {
    id: Int32;
    x: Double;
    y: Double;
    absoluteX: Double;
    absoluteY: Double;
  }[];
  changedTouches: {
    id: Int32;
    x: Double;
    y: Double;
    absoluteX: Double;
    absoluteY: Double;
  }[];
  pointerType: Int32;
}>;

export interface NativeProps extends ViewProps {
  onGestureHandlerEvent?: DirectEventHandler<GestureHandlerEvent>;
  onGestureHandlerAnimatedEvent?: DirectEventHandler<GestureHandlerEvent>;
  onGestureHandlerStateChange?: DirectEventHandler<GestureHandlerStateChangeEvent>;
  onGestureHandlerTouchEvent?: DirectEventHandler<GestureHandlerTouchEvent>;

  handlerTags: Int32[];
  dispatchesAnimatedEvents: boolean;
  moduleId: Int32;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerDetector', {
  interfaceOnly: true,
});
