import * as React from 'react';
import {
  AccessibilityProps,
  ColorValue,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type { NativeViewGestureHandlerProps } from '../../handlers/NativeViewGestureHandler';

export interface RawButtonProps
  extends NativeViewGestureHandlerProps,
    AccessibilityProps {
  /**
   * Defines if more than one button could be pressed simultaneously. By default
   * set true.
   */
  exclusive?: boolean;
  // TODO: we should transform props in `createNativeWrapper`
  /**
   * Android only.
   *
   * Defines color of native ripple animation used since API level 21.
   */
  rippleColor?: number | ColorValue | null;

  /**
   * Android only.
   *
   * Defines radius of native ripple animation used since API level 21.
   */
  rippleRadius?: number | null;

  /**
   * Android only.
   *
   * Set this to true if you want the ripple animation to render outside the view bounds.
   */
  borderless?: boolean;

  /**
   * Android only.
   *
   * Defines whether the ripple animation should be drawn on the foreground of the view.
   */
  foreground?: boolean;

  /**
   * Android only.
   *
   * Set this to true if you don't want the system to play sound when the button is pressed.
   */
  touchSoundDisabled?: boolean;

  /**
   * Style object, use it to set additional styles.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Invoked on mount and layout changes.
   */
  onLayout?: (event: LayoutChangeEvent) => void;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPress?: Function | null;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPressIn?: Function | null;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPressOut?: Function | null;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onLongPress?: Function | null;
}
interface ButtonWithRefProps {
  ref?: React.RefObject<any>;
}

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
export interface BaseButtonWithRefProps
  extends BaseButtonProps,
    ButtonWithRefProps {}

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
export interface RectButtonWithRefProps
  extends RectButtonProps,
    ButtonWithRefProps {}

export interface BorderlessButtonProps extends BaseButtonProps {
  /**
   * iOS only.
   *
   * Opacity applied to the button when it is in an active state.
   */
  activeOpacity?: number;
}
export interface BorderlessButtonWithRefProps
  extends BorderlessButtonProps,
    ButtonWithRefProps {}
