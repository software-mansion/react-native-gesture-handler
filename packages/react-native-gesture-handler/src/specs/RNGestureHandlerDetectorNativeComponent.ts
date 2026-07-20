import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

type GestureHandlerEvent = Readonly<{
  handlerTag: CodegenTypes.Int32;
  state: CodegenTypes.Int32;
  handlerData: CodegenTypes.UnsafeMixed;
}>;

type GestureHandlerStateChangeEvent = Readonly<{
  handlerTag: CodegenTypes.Int32;
  state: CodegenTypes.Int32;
  oldState: CodegenTypes.Int32;
  handlerData: CodegenTypes.UnsafeMixed;
}>;

type GestureHandlerTouchEvent = Readonly<{
  handlerTag: CodegenTypes.Int32;
  numberOfTouches: CodegenTypes.Int32;
  state: CodegenTypes.Int32;
  eventType: CodegenTypes.Int32;
  allTouches: {
    id: CodegenTypes.Int32;
    x: CodegenTypes.Double;
    y: CodegenTypes.Double;
    absoluteX: CodegenTypes.Double;
    absoluteY: CodegenTypes.Double;
  }[];
  changedTouches: {
    id: CodegenTypes.Int32;
    x: CodegenTypes.Double;
    y: CodegenTypes.Double;
    absoluteX: CodegenTypes.Double;
    absoluteY: CodegenTypes.Double;
  }[];
  pointerType: CodegenTypes.Int32;
}>;

export interface VirtualChildrenProps {
  handlerTags: CodegenTypes.Int32[];
  viewTag: CodegenTypes.Int32;
}

// @ts-expect-error WithDefault adds `| null` to the type, which doesn't align with ViewProps.pointerEvents
// Using Exclude to remove null from the type makes the error go away, but breaks codegen.
export interface NativeProps extends ViewProps {
  onGestureHandlerEvent?:
    | CodegenTypes.DirectEventHandler<GestureHandlerEvent>
    | undefined;
  onGestureHandlerStateChange?:
    | CodegenTypes.DirectEventHandler<GestureHandlerStateChangeEvent>
    | undefined;
  onGestureHandlerTouchEvent?:
    | CodegenTypes.DirectEventHandler<GestureHandlerTouchEvent>
    | undefined;
  onGestureHandlerReanimatedEvent?:
    | CodegenTypes.DirectEventHandler<GestureHandlerEvent>
    | undefined;
  onGestureHandlerReanimatedStateChange?:
    | CodegenTypes.DirectEventHandler<GestureHandlerStateChangeEvent>
    | undefined;
  onGestureHandlerReanimatedTouchEvent?:
    | CodegenTypes.DirectEventHandler<GestureHandlerTouchEvent>
    | undefined;
  onGestureHandlerAnimatedEvent?:
    | CodegenTypes.DirectEventHandler<GestureHandlerEvent>
    | undefined;

  handlerTags: CodegenTypes.Int32[];
  moduleId: CodegenTypes.Int32;
  virtualChildren: VirtualChildrenProps[];

  pointerEvents?: CodegenTypes.WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerDetector', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
