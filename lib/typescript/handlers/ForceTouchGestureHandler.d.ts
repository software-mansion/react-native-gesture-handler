import React from 'react';
import { BaseGestureHandlerProps } from './gestureHandlerCommon';
export declare const forceTouchGestureHandlerProps: readonly ["minForce", "maxForce", "feedbackOnActivation"];
declare class ForceTouchFallback extends React.Component {
    static forceTouchAvailable: boolean;
    componentDidMount(): void;
    render(): React.ReactNode;
}
export declare type ForceTouchGestureHandlerEventPayload = {
    x: number;
    y: number;
    absoluteX: number;
    absoluteY: number;
    /**
     * The pressure of a touch.
     */
    force: number;
};
export interface ForceTouchGestureConfig {
    /**
     *
     * A minimal pressure that is required before handler can activate. Should be a
     * value from range `[0.0, 1.0]`. Default is `0.2`.
     */
    minForce?: number;
    /**
     * A maximal pressure that could be applied for handler. If the pressure is
     * greater, handler fails. Should be a value from range `[0.0, 1.0]`.
     */
    maxForce?: number;
    /**
     * Boolean value defining if haptic feedback has to be performed on
     * activation.
     */
    feedbackOnActivation?: boolean;
}
export interface ForceTouchGestureHandlerProps extends BaseGestureHandlerProps<ForceTouchGestureHandlerEventPayload>, ForceTouchGestureConfig {
}
export declare type ForceTouchGestureHandler = typeof ForceTouchGestureHandler & {
    forceTouchAvailable: boolean;
};
export declare const ForceTouchGestureHandler: typeof ForceTouchFallback | React.ComponentClass<ForceTouchGestureHandlerProps & React.RefAttributes<any>, any> | React.FunctionComponent<ForceTouchGestureHandlerProps & React.RefAttributes<any>>;
export {};
