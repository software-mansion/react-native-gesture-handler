import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Int32,
  DirectEventHandler,
  UnsafeMixed,
  Double,
  WithDefault,
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

export interface VirtualChildrenProps {
  handlerTags: Int32[];
  viewTag: Int32;
}

// @ts-expect-error WithDefault adds `| null` to the type, which doesn't align with ViewProps.pointerEvents
// Using Exclude to remove null from the type makes the error go away, but breaks codegen.
export interface NativeProps extends ViewProps {
  onGestureHandlerEvent?: DirectEventHandler<GestureHandlerEvent>;
  onGestureHandlerStateChange?: DirectEventHandler<GestureHandlerStateChangeEvent>;
  onGestureHandlerTouchEvent?: DirectEventHandler<GestureHandlerTouchEvent>;
  onGestureHandlerReanimatedEvent?: DirectEventHandler<GestureHandlerEvent>;
  onGestureHandlerReanimatedStateChange?: DirectEventHandler<GestureHandlerStateChangeEvent>;
  onGestureHandlerReanimatedTouchEvent?: DirectEventHandler<GestureHandlerTouchEvent>;
  onGestureHandlerAnimatedEvent?: DirectEventHandler<GestureHandlerEvent>;

  handlerTags: Int32[];
  moduleId: Int32;
  virtualChildren: VirtualChildrenProps[];

  pointerEvents?: WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerDetector', {
  interfaceOnly: true,
});
