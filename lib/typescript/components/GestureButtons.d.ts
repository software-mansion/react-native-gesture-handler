import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { NativeViewGestureHandlerProps } from '../handlers/NativeViewGestureHandler';
export interface RawButtonProps extends NativeViewGestureHandlerProps {
    /**
     * Defines if more than one button could be pressed simultaneously. By default
     * set true.
     */
    exclusive?: boolean;
    /**
     * Android only.
     *
     * Defines color of native ripple animation used since API level 21.
     */
    rippleColor?: any;
}
export interface BaseButtonProps extends RawButtonProps {
    /**
     * Called when the button gets pressed (analogous to `onPress` in
     * `TouchableHighlight` from RN core).
     */
    onPress?: (pointerInside: boolean) => void;
    /**
     * Called when button changes from inactive to active and vice versa. It
     * passes active state as a boolean variable as a first parameter for that
     * method.
     */
    onActiveStateChange?: (active: boolean) => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
export interface RectButtonProps extends BaseButtonProps {
    /**
     * Background color that will be dimmed when button is in active state.
     */
    underlayColor?: string;
    /**
     * iOS only.
     *
     * Opacity applied to the underlay when button is in active state.
     */
    activeOpacity?: number;
}
export interface BorderlessButtonProps extends BaseButtonProps {
    /**
     * Android only.
     *
     * Set this to false if you want the ripple animation to render only within view bounds.
     */
    borderless?: boolean;
    /**
     * iOS only.
     *
     * Opacity applied to the button when it is in an active state.
     */
    activeOpacity?: number;
}
export declare const RawButton: React.ForwardRefExoticComponent<RawButtonProps & NativeViewGestureHandlerProps & React.RefAttributes<React.ComponentType<any>>>;
export declare class BaseButton extends React.Component<BaseButtonProps> {
    private lastActive;
    constructor(props: BaseButtonProps);
    private handleEvent;
    private onHandlerStateChange;
    private onGestureEvent;
    render(): JSX.Element;
}
export declare class RectButton extends React.Component<RectButtonProps> {
    static defaultProps: {
        activeOpacity: number;
        underlayColor: string;
    };
    private opacity;
    constructor(props: RectButtonProps);
    private onActiveStateChange;
    render(): JSX.Element;
}
export declare class BorderlessButton extends React.Component<BorderlessButtonProps> {
    static defaultProps: {
        activeOpacity: number;
        borderless: boolean;
    };
    private opacity;
    constructor(props: BorderlessButtonProps);
    private onActiveStateChange;
    render(): JSX.Element;
}
export { default as PureNativeButton } from './GestureHandlerButton';
