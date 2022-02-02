import { Animated, TouchableOpacityProps } from 'react-native';
import { GenericTouchableProps } from './GenericTouchable';
import { Component } from 'react';
/**
 * TouchableOpacity bases on timing animation which has been used in RN's core
 */
export default class TouchableOpacity extends Component<TouchableOpacityProps & GenericTouchableProps> {
    static defaultProps: {
        activeOpacity: number;
        delayLongPress: number;
        extraButtonProps: {
            rippleColor: string;
            exclusive: boolean;
        };
    };
    getChildStyleOpacityWithDefault: () => number;
    opacity: Animated.Value;
    setOpacityTo: (value: number, duration: number) => void;
    onStateChange: (_from: number, to: number) => void;
    render(): JSX.Element;
}
