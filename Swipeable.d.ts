declare module 'react-native-gesture-handler/Swipeable' {
  import * as React from 'react'
  import { Animated, StyleProp, ViewStyle } from 'react-native';
  import { PanGestureHandlerProperties } from 'react-native-gesture-handler'
  type SwipeableExcludes = Exclude<keyof PanGestureHandlerProperties, 'onGestureEvent' | 'onHandlerStateChange'>

  interface SwipeableProperties extends Pick<PanGestureHandlerProperties, SwipeableExcludes> {
    enableTrackpadTwoFingerGesture?: boolean;
    friction?: number;
    leftThreshold?: number;
    rightThreshold?: number;
    overshootLeft?: boolean;
    overshootRight?: boolean;
    overshootFriction?: number,
    onSwipeableLeftOpen?: () => void;
    onSwipeableRightOpen?: () => void;
    onSwipeableOpen?: () => void;
    onSwipeableClose?: () => void;
    onSwipeableLeftWillOpen?: () => void;
    onSwipeableRightWillOpen?: () => void;
    onSwipeableWillOpen?: () => void;
    onSwipeableWillClose?: () => void;
    /**
     *
     * This map describes the values to use as inputRange for extra interpolation:
     * AnimatedValue: [startValue, endValue]
     *
     * progressAnimatedValue: [0, 1]
     * dragAnimatedValue: [0, +]
     *
     * To support `rtl` flexbox layouts use `flexDirection` styling.
     * */
    renderLeftActions?: (
      progressAnimatedValue: Animated.AnimatedInterpolation,
      dragAnimatedValue: Animated.AnimatedInterpolation
    ) => React.ReactNode;
    /**
     *
     * This map describes the values to use as inputRange for extra interpolation:
     * AnimatedValue: [startValue, endValue]
     *
     * progressAnimatedValue: [0, 1]
     * dragAnimatedValue: [0, -]
     *
     * To support `rtl` flexbox layouts use `flexDirection` styling.
     * */
    renderRightActions?: (
      progressAnimatedValue: Animated.AnimatedInterpolation,
      dragAnimatedValue: Animated.AnimatedInterpolation
    ) => React.ReactNode;
    useNativeAnimations?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    childrenContainerStyle?: StyleProp<ViewStyle>;
  }

  export default class Swipeable extends React.Component<SwipeableProperties> {
    close: () => void;
    openLeft: () => void;
    openRight: () => void;
  }
}
