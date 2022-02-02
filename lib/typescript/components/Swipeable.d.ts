import * as React from 'react';
import { Component } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { PanGestureHandlerProps } from '../handlers/PanGestureHandler';
declare type SwipeableExcludes = Exclude<keyof PanGestureHandlerProps, 'onGestureEvent' | 'onHandlerStateChange'>;
export interface SwipeableProps extends Pick<PanGestureHandlerProps, SwipeableExcludes> {
    /**
     * Enables two-finger gestures on supported devices, for example iPads with
     * trackpads. If not enabled the gesture will require click + drag, with
     * `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger
     * the gesture.
     */
    enableTrackpadTwoFingerGesture?: boolean;
    /**
     * Specifies how much the visual interaction will be delayed compared to the
     * gesture distance. e.g. value of 1 will indicate that the swipeable panel
     * should exactly follow the gesture, 2 means it is going to be two times
     * "slower".
     */
    friction?: number;
    /**
     * Distance from the left edge at which released panel will animate to the
     * open state (or the open panel will animate into the closed state). By
     * default it's a half of the panel's width.
     */
    leftThreshold?: number;
    /**
     * Distance from the right edge at which released panel will animate to the
     * open state (or the open panel will animate into the closed state). By
     * default it's a half of the panel's width.
     */
    rightThreshold?: number;
    /**
     * Value indicating if the swipeable panel can be pulled further than the left
     * actions panel's width. It is set to true by default as long as the left
     * panel render method is present.
     */
    overshootLeft?: boolean;
    /**
     * Value indicating if the swipeable panel can be pulled further than the
     * right actions panel's width. It is set to true by default as long as the
     * right panel render method is present.
     */
    overshootRight?: boolean;
    /**
     * Specifies how much the visual interaction will be delayed compared to the
     * gesture distance at overshoot. Default value is 1, it mean no friction, for
     * a native feel, try 8 or above.
     */
    overshootFriction?: number;
    /**
     * Called when left action panel gets open.
     */
    onSwipeableLeftOpen?: () => void;
    /**
     * Called when right action panel gets open.
     */
    onSwipeableRightOpen?: () => void;
    /**
     * Called when action panel gets open (either right or left).
     */
    onSwipeableOpen?: () => void;
    /**
     * Called when action panel is closed.
     */
    onSwipeableClose?: () => void;
    /**
     * Called when left action panel starts animating on open.
     */
    onSwipeableLeftWillOpen?: () => void;
    /**
     * Called when right action panel starts animating on open.
     */
    onSwipeableRightWillOpen?: () => void;
    /**
     * Called when action panel starts animating on open (either right or left).
     */
    onSwipeableWillOpen?: () => void;
    /**
     * Called when action panel starts animating on close.
     */
    onSwipeableWillClose?: () => void;
    /**
     *
     * This map describes the values to use as inputRange for extra interpolation:
     * AnimatedValue: [startValue, endValue]
     *
     * progressAnimatedValue: [0, 1] dragAnimatedValue: [0, +]
     *
     * To support `rtl` flexbox layouts use `flexDirection` styling.
     * */
    renderLeftActions?: (progressAnimatedValue: Animated.AnimatedInterpolation, dragAnimatedValue: Animated.AnimatedInterpolation) => React.ReactNode;
    /**
     *
     * This map describes the values to use as inputRange for extra interpolation:
     * AnimatedValue: [startValue, endValue]
     *
     * progressAnimatedValue: [0, 1] dragAnimatedValue: [0, -]
     *
     * To support `rtl` flexbox layouts use `flexDirection` styling.
     * */
    renderRightActions?: (progressAnimatedValue: Animated.AnimatedInterpolation, dragAnimatedValue: Animated.AnimatedInterpolation) => React.ReactNode;
    useNativeAnimations?: boolean;
    animationOptions?: Record<string, unknown>;
    /**
     * Style object for the container (`Animated.View`), for example to override
     * `overflow: 'hidden'`.
     */
    containerStyle?: StyleProp<ViewStyle>;
    /**
     * Style object for the children container (`Animated.View`), for example to
     * apply `flex: 1`
     */
    childrenContainerStyle?: StyleProp<ViewStyle>;
}
declare type SwipeableState = {
    dragX: Animated.Value;
    rowTranslation: Animated.Value;
    rowState: number;
    leftWidth?: number;
    rightOffset?: number;
    rowWidth?: number;
};
export default class Swipeable extends Component<SwipeableProps, SwipeableState> {
    static defaultProps: {
        friction: number;
        overshootFriction: number;
        useNativeAnimations: boolean;
    };
    constructor(props: SwipeableProps);
    UNSAFE_componentWillUpdate(props: SwipeableProps, state: SwipeableState): void;
    private onGestureEvent?;
    private transX?;
    private showLeftAction?;
    private leftActionTranslate?;
    private showRightAction?;
    private rightActionTranslate?;
    private updateAnimatedEvent;
    private onTapHandlerStateChange;
    private onHandlerStateChange;
    private handleRelease;
    private animateRow;
    private onRowLayout;
    private currentOffset;
    close: () => void;
    openLeft: () => void;
    openRight: () => void;
    render(): JSX.Element;
}
export {};
