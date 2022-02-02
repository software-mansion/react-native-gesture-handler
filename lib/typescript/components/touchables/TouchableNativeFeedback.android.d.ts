import { TouchableNativeFeedbackProps, ColorValue } from 'react-native';
import { Component } from 'react';
import { GenericTouchableProps } from './GenericTouchable';
export declare type TouchableNativeFeedbackExtraProps = {
    borderless?: boolean;
    rippleColor?: number | null;
    rippleRadius?: number | null;
    foreground?: boolean;
};
/**
 * TouchableNativeFeedback behaves slightly different than RN's TouchableNativeFeedback.
 * There's small difference with handling long press ripple since RN's implementation calls
 * ripple animation via bridge. This solution leaves all animations' handling for native components so
 * it follows native behaviours.
 */
export default class TouchableNativeFeedback extends Component<TouchableNativeFeedbackProps & GenericTouchableProps> {
    static defaultProps: {
        useForeground: boolean;
        extraButtonProps: {
            rippleColor: null;
        };
        delayLongPress: number;
    };
    static SelectableBackground: (rippleRadius?: number | undefined) => {
        type: string;
        attribute: string;
        rippleRadius: number | undefined;
    };
    static SelectableBackgroundBorderless: (rippleRadius?: number | undefined) => {
        type: string;
        attribute: string;
        rippleRadius: number | undefined;
    };
    static Ripple: (color: ColorValue, borderless: boolean, rippleRadius?: number | undefined) => {
        type: string;
        color: string | symbol;
        borderless: boolean;
        rippleRadius: number | undefined;
    };
    static canUseNativeForeground: () => boolean;
    getExtraButtonProps(): TouchableNativeFeedbackExtraProps;
    render(): JSX.Element;
}
