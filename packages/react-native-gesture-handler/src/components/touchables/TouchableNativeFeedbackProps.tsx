import type { ExtraButtonProps } from './ExtraButtonProps';
import type { GenericTouchableProps } from './GenericTouchableProps';
import type { TouchableNativeFeedbackProps as RNTouchableNativeFeedbackProps } from 'react-native';

export type TouchableNativeFeedbackExtraProps = ExtraButtonProps;
/**
 * @deprecated TouchableNativeFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
export type TouchableNativeFeedbackProps = RNTouchableNativeFeedbackProps &
  GenericTouchableProps;
