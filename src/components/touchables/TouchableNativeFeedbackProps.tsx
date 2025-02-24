import type { TouchableNativeFeedbackProps as RNTouchableNativeFeedbackProps } from 'react-native';
import type { GenericTouchableProps } from './GenericTouchableProps';
import { ExtraButtonProps } from './ExtraButtonProps';

export type TouchableNativeFeedbackExtraProps = ExtraButtonProps;
/**
 * @deprecated TouchableNativeFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
export type TouchableNativeFeedbackProps = RNTouchableNativeFeedbackProps &
  GenericTouchableProps;
