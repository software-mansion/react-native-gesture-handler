import type { TouchableNativeFeedbackProps as RNTouchableNativeFeedbackProps } from 'react-native';
import type { GenericTouchableProps } from './GenericTouchableProps';

export type TouchableNativeFeedbackExtraProps = {
  borderless?: boolean;
  rippleColor?: number | null;
  rippleRadius?: number | null;
  foreground?: boolean;
};

/**
 * @deprecated TouchableNativeFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
export type TouchableNativeFeedbackProps = RNTouchableNativeFeedbackProps &
  GenericTouchableProps;
