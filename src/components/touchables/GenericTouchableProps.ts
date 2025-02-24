import type {
  StyleProp,
  ViewStyle,
  TouchableWithoutFeedbackProps,
  Insets,
} from 'react-native';
import type { UserSelect } from '../../handlers/gestureHandlerCommon';
import { ExtraButtonProps } from './ExtraButtonProps';

export interface GenericTouchableProps
  extends Omit<TouchableWithoutFeedbackProps, 'hitSlop'> {
  // Decided to drop not used fields from RN's implementation.
  // e.g. onBlur and onFocus as well as deprecated props. - TODO: this comment may be unuseful in this moment
  // TODO: in RN these events get native event parameter, which prolly could be used in our implementation too
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;

  nativeID?: string;
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
  hitSlop?: Insets | number;
  userSelect?: UserSelect;
  extraButtonProps?: ExtraButtonProps;
}
