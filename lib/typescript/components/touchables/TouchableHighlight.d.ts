import { Component } from 'react';
import { GenericTouchableProps } from './GenericTouchable';
import { TouchableHighlightProps, ColorValue } from 'react-native';
interface State {
    extraChildStyle: null | {
        opacity?: number;
    };
    extraUnderlayStyle: null | {
        backgroundColor?: ColorValue;
    };
}
/**
 * TouchableHighlight follows RN's implementation
 */
export default class TouchableHighlight extends Component<TouchableHighlightProps & GenericTouchableProps, State> {
    static defaultProps: {
        activeOpacity: number;
        delayPressOut: number;
        underlayColor: string;
        delayLongPress: number;
        extraButtonProps: {
            rippleColor: string;
            exclusive: boolean;
        };
    };
    constructor(props: TouchableHighlightProps & GenericTouchableProps);
    showUnderlay: () => void;
    hasPressHandler: () => (((event: import("react-native").GestureResponderEvent) => void) & (() => void)) | undefined;
    hideUnderlay: () => void;
    renderChildren(): JSX.Element;
    onStateChange: (_from: number, to: number) => void;
    render(): JSX.Element;
}
export {};
