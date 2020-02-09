declare module 'react-native-gesture-handler/Swipeable' {
  import { Animated, StyleProp, ViewStyle } from 'react-native';
  import { PanGestureHandlerProperties } from 'react-native-gesture-handler'
  type SwipeableExcludes = Exclude<keyof PanGestureHandlerProperties, 'onGestureEvent' | 'onHandlerStateChange'>

  interface SwipeableProperties extends Pick<PanGestureHandlerProperties, SwipeableExcludes> {
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

declare module 'react-native-gesture-handler/DrawerLayout' {
  import * as React from 'react'
  import { Animated, StatusBarAnimation, StyleProp, ViewStyle } from 'react-native';

  export type DrawerPosition = 'left' | 'right';

  export type DrawerState = 'Idle' | 'Dragging' | 'Settling';

  export type DrawerType = 'front' | 'back' | 'slide';

  export type DrawerLockMode = 'unlocked' | 'locked-closed' | 'locked-open';

  export type DrawerKeyboardDismissMode = 'none' | 'on-drag';

  export interface DrawerLayoutProperties {
    renderNavigationView: (
      progressAnimatedValue: Animated.Value
    ) => React.ReactNode;
    drawerPosition?: DrawerPosition;
    drawerWidth?: number;
    drawerBackgroundColor?: string;
    drawerLockMode?: DrawerLockMode;
    keyboardDismissMode?: DrawerKeyboardDismissMode;
    onDrawerClose?: () => void;
    onDrawerOpen?: () => void;
    onDrawerStateChanged?: (
      newState: DrawerState,
      drawerWillShow: boolean
    ) => void;
    useNativeAnimations?: boolean;

    drawerType?: DrawerType;
    edgeWidth?: number;
    minSwipeDistance?: number;
    hideStatusBar?: boolean;
    statusBarAnimation?: StatusBarAnimation;
    overlayColor?: string;
    contentContainerStyle?: StyleProp<ViewStyle>;
  }

  interface DrawerMovementOptionType {
    velocity?: number;
  }

  export default class DrawerLayout extends React.Component<DrawerLayoutProperties> {
    openDrawer: (options?: DrawerMovementOptionType) => void;
    closeDrawer: (options?: DrawerMovementOptionType) => void;
  }
}
