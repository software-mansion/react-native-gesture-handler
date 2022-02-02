import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare type RotationGestureHandlerEventPayload = {
    /**
     * Amount rotated, expressed in radians, from the gesture's focal point
     * (anchor).
     */
    rotation: number;
    /**
     * X coordinate, expressed in points, of the gesture's central focal point
     * (anchor).
     */
    anchorX: number;
    /**
     * Y coordinate, expressed in points, of the gesture's central focal point
     * (anchor).
     */
    anchorY: number;
    /**
     *
     * Instantaneous velocity, expressed in point units per second, of the
     * gesture.
     */
    velocity: number;
};
export interface RotationGestureHandlerProps extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload> {
}
export declare type RotationGestureHandler = typeof RotationGestureHandler;
export declare const RotationGestureHandler: import("react").ComponentType<RotationGestureHandlerProps & import("react").RefAttributes<any>>;
