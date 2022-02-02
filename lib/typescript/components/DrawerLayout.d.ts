import * as React from 'react';
import { Component } from 'react';
import { Animated, StatusBarAnimation, StyleProp, ViewStyle } from 'react-native';
import { PanGestureHandler } from '../handlers/PanGestureHandler';
export declare type DrawerPosition = 'left' | 'right';
export declare type DrawerState = 'Idle' | 'Dragging' | 'Settling';
export declare type DrawerType = 'front' | 'back' | 'slide';
export declare type DrawerLockMode = 'unlocked' | 'locked-closed' | 'locked-open';
export declare type DrawerKeyboardDismissMode = 'none' | 'on-drag';
export interface DrawerLayoutProps {
    /**
     * This attribute is present in the standard implementation already and is one
     * of the required params. Gesture handler version of DrawerLayout make it
     * possible for the function passed as `renderNavigationView` to take an
     * Animated value as a parameter that indicates the progress of drawer
     * opening/closing animation (progress value is 0 when closed and 1 when
     * opened). This can be used by the drawer component to animated its children
     * while the drawer is opening or closing.
     */
    renderNavigationView: (progressAnimatedValue: Animated.Value) => React.ReactNode;
    drawerPosition?: DrawerPosition;
    drawerWidth?: number;
    drawerBackgroundColor?: string;
    drawerLockMode?: DrawerLockMode;
    keyboardDismissMode?: DrawerKeyboardDismissMode;
    /**
     * Called when the drawer is closed.
     */
    onDrawerClose?: () => void;
    /**
     * Called when the drawer is opened.
     */
    onDrawerOpen?: () => void;
    /**
     * Called when the status of the drawer changes.
     */
    onDrawerStateChanged?: (newState: DrawerState, drawerWillShow: boolean) => void;
    useNativeAnimations?: boolean;
    drawerType?: DrawerType;
    /**
     * Defines how far from the edge of the content view the gesture should
     * activate.
     */
    edgeWidth?: number;
    minSwipeDistance?: number;
    /**
     * When set to true Drawer component will use
     * {@link https://reactnative.dev/docs/statusbar StatusBar} API to hide the OS
     * status bar whenever the drawer is pulled or when its in an "open" state.
     */
    hideStatusBar?: boolean;
    /**
     * @default 'slide'
     *
     * Can be used when hideStatusBar is set to true and will select the animation
     * used for hiding/showing the status bar. See
     * {@link https://reactnative.dev/docs/statusbar StatusBar} documentation for
     * more details
     */
    statusBarAnimation?: StatusBarAnimation;
    /**
     * @default black
     *
     * Color of a semi-transparent overlay to be displayed on top of the content
     * view when drawer gets open. A solid color should be used as the opacity is
     * added by the Drawer itself and the opacity of the overlay is animated (from
     * 0% to 70%).
     */
    overlayColor?: string;
    contentContainerStyle?: StyleProp<ViewStyle>;
    drawerContainerStyle?: StyleProp<ViewStyle>;
    /**
     * Enables two-finger gestures on supported devices, for example iPads with
     * trackpads. If not enabled the gesture will require click + drag, with
     * `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger
     * the gesture.
     */
    enableTrackpadTwoFingerGesture?: boolean;
    onDrawerSlide?: (position: number) => void;
    onGestureRef?: (ref: PanGestureHandler) => void;
}
export declare type DrawerLayoutState = {
    dragX: Animated.Value;
    touchX: Animated.Value;
    drawerTranslation: Animated.Value;
    containerWidth: number;
};
export declare type DrawerMovementOption = {
    velocity?: number;
    speed?: number;
};
export default class DrawerLayout extends Component<DrawerLayoutProps, DrawerLayoutState> {
    static defaultProps: {
        drawerWidth: number;
        drawerPosition: string;
        useNativeAnimations: boolean;
        drawerType: string;
        edgeWidth: number;
        minSwipeDistance: number;
        overlayColor: string;
        drawerLockMode: string;
        enableTrackpadTwoFingerGesture: boolean;
    };
    constructor(props: DrawerLayoutProps);
    UNSAFE_componentWillUpdate(props: DrawerLayoutProps, state: DrawerLayoutState): void;
    private openValue?;
    private onGestureEvent?;
    private accessibilityIsModalView;
    private pointerEventsView;
    private panGestureHandler;
    private drawerShown;
    static positions: {
        Left: string;
        Right: string;
    };
    private updateAnimatedEvent;
    private handleContainerLayout;
    private emitStateChanged;
    private openingHandlerStateChange;
    private onTapHandlerStateChange;
    private handleRelease;
    private updateShowing;
    private animateDrawer;
    openDrawer: (options?: DrawerMovementOption) => void;
    closeDrawer: (options?: DrawerMovementOption) => void;
    private renderOverlay;
    private renderDrawer;
    private setPanGestureRef;
    render(): JSX.Element;
}
