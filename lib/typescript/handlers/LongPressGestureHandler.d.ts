import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare const longPressGestureHandlerProps: readonly ["minDurationMs", "maxDist"];
export declare type LongPressGestureHandlerEventPayload = {
    /**
     * X coordinate, expressed in points, of the current position of the pointer
     * (finger or a leading pointer when there are multiple fingers placed)
     * relative to the view attached to the handler.
     */
    x: number;
    /**
     * Y coordinate, expressed in points, of the current position of the pointer
     * (finger or a leading pointer when there are multiple fingers placed)
     * relative to the view attached to the handler.
     */
    y: number;
    /**
     * X coordinate, expressed in points, of the current position of the pointer
     * (finger or a leading pointer when there are multiple fingers placed)
     * relative to the window. It is recommended to use `absoluteX` instead of
     * `x` in cases when the view attached to the handler can be transformed as an
     * effect of the gesture.
     */
    absoluteX: number;
    /**
     * Y coordinate, expressed in points, of the current position of the pointer
     * (finger or a leading pointer when there are multiple fingers placed)
     * relative to the window. It is recommended to use `absoluteY` instead of
     * `y` in cases when the view attached to the handler can be transformed as an
     * effect of the gesture.
     */
    absoluteY: number;
    /**
     * Duration of the long press (time since the start of the event), expressed
     * in milliseconds.
     */
    duration: number;
};
export interface LongPressGestureConfig {
    /**
     * Minimum time, expressed in milliseconds, that a finger must remain pressed on
     * the corresponding view. The default value is 500.
     */
    minDurationMs?: number;
    /**
     * Maximum distance, expressed in points, that defines how far the finger is
     * allowed to travel during a long press gesture. If the finger travels
     * further than the defined distance and the handler hasn't yet activated, it
     * will fail to recognize the gesture. The default value is 10.
     */
    maxDist?: number;
}
export interface LongPressGestureHandlerProps extends BaseGestureHandlerProps<LongPressGestureHandlerEventPayload>, LongPressGestureConfig {
}
export declare type LongPressGestureHandler = typeof LongPressGestureHandler;
export declare const LongPressGestureHandler: import("react").ComponentType<LongPressGestureHandlerProps & import("react").RefAttributes<any>>;
