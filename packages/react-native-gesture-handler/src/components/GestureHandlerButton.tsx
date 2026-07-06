import type {
  AccessibilityProps,
  ColorValue,
  HostComponent,
  LayoutChangeEvent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';

import RNGestureHandlerButtonNativeComponent from '../specs/RNGestureHandlerButtonNativeComponent';

export interface ButtonProps extends ViewProps, AccessibilityProps {
  children?: React.ReactNode;
  ref?: React.Ref<React.ComponentRef<typeof ButtonComponent>> | undefined;
  /**
   * Defines if buttons should respond to touches. By default set to true.
   */
  enabled?: boolean | undefined;

  /**
   * Defines if more than one button could be pressed simultaneously. By default
   * set true.
   */
  exclusive?: boolean | undefined;

  /**
   * Android only.
   *
   * Defines color of native ripple animation used since API level 21.
   */
  rippleColor?: number | ColorValue | null | undefined;

  /**
   * Android only.
   *
   * Defines radius of native ripple animation used since API level 21.
   */
  rippleRadius?: number | null | undefined;

  /**
   * Android only.
   *
   * Set this to true if you want the ripple animation to render outside the view bounds.
   */
  borderless?: boolean | undefined;

  /**
   * Android only.
   *
   * Defines whether the ripple animation should be drawn on the foreground of the view.
   */
  foreground?: boolean | undefined;

  /**
   * Android only.
   *
   * Set this to true if you don't want the system to play sound when the button is pressed.
   */
  touchSoundDisabled?: boolean | undefined;

  /**
   * Minimum duration (in milliseconds) of the press-in animation on a
   * quick tap. Defaults to 50ms.
   */
  tapAnimationInDuration?: number | undefined;

  /**
   * Minimum duration (in milliseconds) of the press-out animation on a
   * quick tap. Defaults to 100ms.
   */
  tapAnimationOutDuration?: number | undefined;

  /**
   * Threshold (in milliseconds) at which the press-out animation
   * switches from the tap-out timing to `longPressAnimationOutDuration`.
   * Set to any negative value to disable the switch.
   */
  longPressDuration?: number | undefined;

  /**
   * Duration of the press-out animation, in milliseconds, when the
   * button is released after being held past `longPressDuration`.
   * Defaults to `tapAnimationOutDuration` when not set (or set to any
   * negative value).
   */
  longPressAnimationOutDuration?: number | undefined;

  /**
   * Opacity applied to the button when it is pressed.
   */
  activeOpacity?: number | undefined;

  /**
   * Scale applied to the button when it is pressed.
   */
  activeScale?: number | undefined;

  /**
   * Opacity applied to the underlay when the button is pressed.
   */
  activeUnderlayOpacity?: number | undefined;

  /**
   * Opacity applied to the button when it is hovered. Defaults to
   * `defaultOpacity` when not set.
   */
  hoverOpacity?: number | undefined;

  /**
   * Scale applied to the button when it is hovered. Defaults to
   * `defaultScale` when not set.
   */
  hoverScale?: number | undefined;

  /**
   * Opacity applied to the underlay when the button is hovered. Defaults
   * to `defaultUnderlayOpacity` when not set.
   */
  hoverUnderlayOpacity?: number | undefined;

  /**
   * Duration of the hover-in animation, in milliseconds. Defaults to 50ms.
   */
  hoverAnimationInDuration?: number | undefined;

  /**
   * Duration of the hover-out animation, in milliseconds. Defaults to 100ms.
   */
  hoverAnimationOutDuration?: number | undefined;

  /**
   * Opacity applied to the button when it is not pressed.
   */
  defaultOpacity?: number | undefined;

  /**
   * Scale applied to the button when it is not pressed.
   */
  defaultScale?: number | undefined;

  /**
   * Opacity applied to the underlay when the button is not pressed.
   */
  defaultUnderlayOpacity?: number | undefined;

  /**
   * Color of the underlay.
   */
  underlayColor?: ColorValue | undefined;

  /**
   * Android only.
   *
   * Whether the view should render with an offscreen alpha-compositing buffer
   * when its `opacity` is less than 1. Defaults to `false` — without the
   * offscreen buffer, children that draw past the view's bounds (e.g. anti-
   * aliased border edges) are not clipped by the layer when `opacity < 1`.
   * Set to `true` to opt back into the standard Android behavior.
   */
  needsOffscreenAlphaCompositing?: boolean | undefined;

  /**
   * Style object, use it to set additional styles.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Invoked on mount and layout changes.
   */
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPress?: Function | null | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPressIn?: Function | null | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPressOut?: Function | null | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onLongPress?: Function | null | undefined;
}

export const ButtonComponent =
  RNGestureHandlerButtonNativeComponent as HostComponent<ButtonProps>;

export default ButtonComponent;
