import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare const nativeViewGestureHandlerProps: readonly ["shouldActivateOnStart", "disallowInterruption"];
export interface NativeViewGestureConfig {
    /**
     * Android only.
     *
     * Determines whether the handler should check for an existing touch event on
     * instantiation.
     */
    shouldActivateOnStart?: boolean;
    /**
     * When `true`, cancels all other gesture handlers when this
     * `NativeViewGestureHandler` receives an `ACTIVE` state event.
     */
    disallowInterruption?: boolean;
}
export interface NativeViewGestureHandlerProps extends BaseGestureHandlerProps<NativeViewGestureHandlerPayload>, NativeViewGestureConfig {
}
export declare type NativeViewGestureHandlerPayload = {
    /**
     * True if gesture was performed inside of containing view, false otherwise.
     */
    pointerInside: boolean;
};
export declare const nativeViewProps: readonly ["id", "enabled", "shouldCancelWhenOutside", "hitSlop", "waitFor", "simultaneousHandlers", "onBegan", "onFailed", "onCancelled", "onActivated", "onEnded", "onGestureEvent", "onHandlerStateChange", "shouldActivateOnStart", "disallowInterruption"];
export declare type NativeViewGestureHandler = typeof NativeViewGestureHandler;
export declare const NativeViewGestureHandler: import("react").ComponentType<NativeViewGestureHandlerProps & import("react").RefAttributes<any>>;
