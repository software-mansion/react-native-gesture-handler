import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare type PinchGestureHandlerEventPayload = {
    /**
     * The scale factor relative to the points of the two touches in screen
     * coordinates.
     */
    scale: number;
    /**
     * Position expressed in points along X axis of center anchor point of
     * gesture.
     */
    focalX: number;
    /**
     * Position expressed in points along Y axis of center anchor point of
     * gesture.
     */
    focalY: number;
    /**
     *
     * Velocity of the pan gesture the current moment. The value is expressed in
     * point units per second.
     */
    velocity: number;
};
export interface PinchGestureHandlerProps extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {
}
export declare type PinchGestureHandler = typeof PinchGestureHandler;
export declare const PinchGestureHandler: import("react").ComponentType<PinchGestureHandlerProps & import("react").RefAttributes<any>>;
