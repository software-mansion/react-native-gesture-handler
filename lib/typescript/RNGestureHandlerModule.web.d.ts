import FlingGestureHandler from './web/FlingGestureHandler';
import LongPressGestureHandler from './web/LongPressGestureHandler';
import NativeViewGestureHandler from './web/NativeViewGestureHandler';
import PanGestureHandler from './web/PanGestureHandler';
import PinchGestureHandler from './web/PinchGestureHandler';
import RotationGestureHandler from './web/RotationGestureHandler';
import TapGestureHandler from './web/TapGestureHandler';
export declare const Gestures: {
    PanGestureHandler: typeof PanGestureHandler;
    RotationGestureHandler: typeof RotationGestureHandler;
    PinchGestureHandler: typeof PinchGestureHandler;
    TapGestureHandler: typeof TapGestureHandler;
    NativeViewGestureHandler: typeof NativeViewGestureHandler;
    LongPressGestureHandler: typeof LongPressGestureHandler;
    FlingGestureHandler: typeof FlingGestureHandler;
};
declare const _default: {
    Direction: {
        RIGHT: number;
        LEFT: number;
        UP: number;
        DOWN: number;
    };
    handleSetJSResponder(tag: number, blockNativeResponder: boolean): void;
    handleClearJSResponder(): void;
    createGestureHandler<T>(handlerName: keyof typeof Gestures, handlerTag: number, config: T): void;
    attachGestureHandler(handlerTag: number, newView: number, _usingDeviceEvents: boolean, propsRef: React.RefObject<unknown>): void;
    updateGestureHandler(handlerTag: number, newConfig: any): void;
    getGestureHandlerNode(handlerTag: number): PanGestureHandler | RotationGestureHandler | PinchGestureHandler | TapGestureHandler | NativeViewGestureHandler | LongPressGestureHandler | FlingGestureHandler;
    dropGestureHandler(handlerTag: number): void;
};
export default _default;
