import type { TouchableNativeFeedbackProps as RNTouchableNativeFeedbackProps } from 'react-native';
import type { GenericTouchableProps } from './GenericTouchableProps';

export type TouchableNativeFeedbackExtraProps = {
  borderless?: boolean;
  rippleColor?: number | string | null;
  rippleRadius?: number | null;
  foreground?: boolean;
  exclusive?: boolean;
};

export type TouchableNativeFeedbackProps = RNTouchableNativeFeedbackProps &
  GenericTouchableProps;
