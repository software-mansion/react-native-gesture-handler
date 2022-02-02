import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare const panGestureHandlerProps: readonly ["activeOffsetY", "activeOffsetX", "failOffsetY", "failOffsetX", "minDist", "minVelocity", "minVelocityX", "minVelocityY", "minPointers", "maxPointers", "avgTouches", "enableTrackpadTwoFingerGesture"];
export declare const panGestureHandlerCustomNativeProps: readonly ["activeOffsetYStart", "activeOffsetYEnd", "activeOffsetXStart", "activeOffsetXEnd", "failOffsetYStart", "failOffsetYEnd", "failOffsetXStart", "failOffsetXEnd"];
export declare type PanGestureHandlerEventPayload = {
    /**
     * X coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the view
     * attached to the handler. Expressed in point units.
     */
    x: number;
    /**
     * Y coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the view
     * attached to the handler. Expressed in point units.
     */
    y: number;
    /**
     * X coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the window.
     * The value is expressed in point units. It is recommended to use it instead
     * of `x` in cases when the original view can be transformed as an effect of
     * the gesture.
     */
    absoluteX: number;
    /**
     * Y coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the window.
     * The value is expressed in point units. It is recommended to use it instead
     * of `y` in cases when the original view can be transformed as an
     * effect of the gesture.
     */
    absoluteY: number;
    /**
     * Translation of the pan gesture along X axis accumulated over the time of
     * the gesture. The value is expressed in the point units.
     */
    translationX: number;
    /**
     * Translation of the pan gesture along Y axis accumulated over the time of
     * the gesture. The value is expressed in the point units.
     */
    translationY: number;
    /**
     * Velocity of the pan gesture along the X axis in the current moment. The
     * value is expressed in point units per second.
     */
    velocityX: number;
    /**
     * Velocity of the pan gesture along the Y axis in the current moment. The
     * value is expressed in point units per second.
     */
    velocityY: number;
};
interface CommonPanProperties {
    /**
     * Minimum distance the finger (or multiple finger) need to travel before the
     * handler activates. Expressed in points.
     */
    minDist?: number;
    /**
     * Android only.
     */
    avgTouches?: boolean;
    /**
     * Enables two-finger gestures on supported devices, for example iPads with
     * trackpads. If not enabled the gesture will require click + drag, with
     * enableTrackpadTwoFingerGesture swiping with two fingers will also trigger
     * the gesture.
     */
    enableTrackpadTwoFingerGesture?: boolean;
    /**
     * A number of fingers that is required to be placed before handler can
     * activate. Should be a higher or equal to 0 integer.
     */
    minPointers?: number;
    /**
     * When the given number of fingers is placed on the screen and handler hasn't
     * yet activated it will fail recognizing the gesture. Should be a higher or
     * equal to 0 integer.
     */
    maxPointers?: number;
    minVelocity?: number;
    minVelocityX?: number;
    minVelocityY?: number;
}
export interface PanGestureConfig extends CommonPanProperties {
    activeOffsetYStart?: number;
    activeOffsetYEnd?: number;
    activeOffsetXStart?: number;
    activeOffsetXEnd?: number;
    failOffsetYStart?: number;
    failOffsetYEnd?: number;
    failOffsetXStart?: number;
    failOffsetXEnd?: number;
}
export interface PanGestureHandlerProps extends BaseGestureHandlerProps<PanGestureHandlerEventPayload>, CommonPanProperties {
    /**
     * Range along X axis (in points) where fingers travels without activation of
     * handler. Moving outside of this range implies activation of handler. Range
     * can be given as an array or a single number. If range is set as an array,
     * first value must be lower or equal to 0, a the second one higher or equal
     * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
     * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
     */
    activeOffsetY?: number | number[];
    /**
     * Range along X axis (in points) where fingers travels without activation of
     * handler. Moving outside of this range implies activation of handler. Range
     * can be given as an array or a single number. If range is set as an array,
     * first value must be lower or equal to 0, a the second one higher or equal
     * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
     * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
     */
    activeOffsetX?: number | number[];
    /**
     * When the finger moves outside this range (in points) along Y axis and
     * handler hasn't yet activated it will fail recognizing the gesture. Range
     * can be given as an array or a single number. If range is set as an array,
     * first value must be lower or equal to 0, a the second one higher or equal
     * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
     * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
     */
    failOffsetY?: number | number[];
    /**
     * When the finger moves outside this range (in points) along X axis and
     * handler hasn't yet activated it will fail recognizing the gesture. Range
     * can be given as an array or a single number. If range is set as an array,
     * first value must be lower or equal to 0, a the second one higher or equal
     * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
     * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
     */
    failOffsetX?: number | number[];
}
export declare type PanGestureHandler = typeof PanGestureHandler;
export declare const PanGestureHandler: import("react").ComponentType<PanGestureHandlerProps & import("react").RefAttributes<any>>;
export declare function managePanProps(props: PanGestureHandlerProps): PanGestureHandlerProps & Partial<Record<"failOffsetXStart" | "failOffsetYStart" | "failOffsetXEnd" | "failOffsetYEnd" | "activeOffsetXStart" | "activeOffsetXEnd" | "activeOffsetYStart" | "activeOffsetYEnd", number>>;
export {};
