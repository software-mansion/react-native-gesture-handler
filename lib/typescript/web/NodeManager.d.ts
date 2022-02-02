import { ValueOf } from '../typeUtils';
import { Gestures } from '../RNGestureHandlerModule.web';
export declare function getHandler(tag: number): import("./PanGestureHandler").default | import("./RotationGestureHandler").default | import("./PinchGestureHandler").default | import("./TapGestureHandler").default | import("./NativeViewGestureHandler").default | import("./LongPressGestureHandler").default | import("./FlingGestureHandler").default;
export declare function createGestureHandler(handlerTag: number, handler: InstanceType<ValueOf<typeof Gestures>>): void;
export declare function dropGestureHandler(handlerTag: number): void;
export declare function getNodes(): {
    [x: number]: import("./PanGestureHandler").default | import("./RotationGestureHandler").default | import("./PinchGestureHandler").default | import("./TapGestureHandler").default | import("./NativeViewGestureHandler").default | import("./LongPressGestureHandler").default | import("./FlingGestureHandler").default;
};
