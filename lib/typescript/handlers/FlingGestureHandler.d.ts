import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare const flingGestureHandlerProps: readonly ["numberOfPointers", "direction"];
export declare type FlingGestureHandlerEventPayload = {
    x: number;
    y: number;
    absoluteX: number;
    absoluteY: number;
};
export interface FlingGestureConfig {
    /**
     * Expressed allowed direction of movement. It's possible to pass one or many
     * directions in one parameter:
     *
     * ```js
     * direction={Directions.RIGHT | Directions.LEFT}
     * ```
     *
     * or
     *
     * ```js
     * direction={Directions.DOWN}
     * ```
     */
    direction?: number;
    /**
     * Determine exact number of points required to handle the fling gesture.
     */
    numberOfPointers?: number;
}
export interface FlingGestureHandlerProps extends BaseGestureHandlerProps<FlingGestureHandlerEventPayload>, FlingGestureConfig {
}
export declare type FlingGestureHandler = typeof FlingGestureHandler;
export declare const FlingGestureHandler: import("react").ComponentType<FlingGestureHandlerProps & import("react").RefAttributes<any>>;
