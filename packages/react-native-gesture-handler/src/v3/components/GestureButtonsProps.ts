import { StyleProp, ViewStyle } from 'react-native';
import type { NativeWrapperProperties } from '../types/NativeWrapperType';
import GestureHandlerButton, {
  ButtonProps,
} from '../../components/GestureHandlerButton';

export interface RawButtonProps
  extends ButtonProps,
    Omit<
      NativeWrapperProperties<typeof GestureHandlerButton>,
      'hitSlop' | 'enabled'
    > {}

export interface BaseButtonProps extends RawButtonProps {
  /**
   * Called when the button gets pressed (analogous to `onPress` in
   * `TouchableHighlight` from RN core).
   */
  onPress?: (pointerInside: boolean) => void;

  /**
   * Called when the button gets pressed and is held for `delayLongPress`
   * milliseconds.
   */
  onLongPress?: () => void;

  /**
   * Called when button changes from inactive to active and vice versa. It
   * passes active state as a boolean variable as a first parameter for that
   * method.
   */
  onActiveStateChange?: (active: boolean) => void;
  style?: StyleProp<ViewStyle>;

  /**
   * Delay, in milliseconds, after which the `onLongPress` callback gets called.
   * Defaults to 600.
   */
  delayLongPress?: number;
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
   * iOS only.
   *
   * Opacity applied to the button when it is in an active state.
   */
  activeOpacity?: number;
}
