import {
  ColorValue,
  AccessibilityProps,
  ViewProps,
  NativeSyntheticEvent,
  TargetedEvent,
  Insets,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { GestureStateChangeEvent } from '../handlers/gestureHandlerCommon';
import { HoverGestureHandlerEventPayload } from '../handlers/gestures/hoverGesture';

export interface PressableStateCallbackType {
  readonly pressed: boolean;
}

export interface PressableAndroidRippleConfig {
  color?: null | ColorValue | undefined;
  borderless?: null | boolean | undefined;
  radius?: null | number | undefined;
  foreground?: null | boolean | undefined;
}

export interface PressableProps
  extends AccessibilityProps,
    Omit<ViewProps, 'children' | 'style' | 'hitSlop'> {
  /**
   * Called when the hover is activated to provide visual feedback.
   */
  onHoverIn?:
    | null
    | ((
        event: GestureStateChangeEvent<HoverGestureHandlerEventPayload>
      ) => void);

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?:
    | null
    | ((
        event: GestureStateChangeEvent<HoverGestureHandlerEventPayload>
      ) => void);

  /**
   * Called when a single tap gesture is detected.
   */
  onPress?: null | ((event: GestureResponderEvent) => void);

  /**
   * Called when a touch is engaged before `onPress`.
   */
  onPressIn?: null | ((event: GestureResponderEvent) => void);

  /**
   * Called when a touch is released before `onPress`.
   */
  onPressOut?: null | ((event: GestureResponderEvent) => void);

  /**
   * Called when a long-tap gesture is detected.
   */
  onLongPress?: null | ((event: GestureResponderEvent) => void);

  /**
   * Called after the element loses focus.
   * @platform macos windows
   */
  onBlur?: null | ((event: NativeSyntheticEvent<TargetedEvent>) => void);

  /**
   * Called after the element is focused.
   * @platform macos windows
   */
  onFocus?: null | ((event: NativeSyntheticEvent<TargetedEvent>) => void);

  /**
   * Either children or a render prop that receives a boolean reflecting whether
   * the component is currently pressed.
   */
  children?:
    | React.ReactNode
    | ((state: PressableStateCallbackType) => React.ReactNode);

  /**
   * Whether a press gesture can be interrupted by a parent gesture such as a
   * scroll event. Defaults to true.
   */
  cancelable?: null | boolean;

  /**
   * Duration to wait after hover in before calling `onHoverIn`.
   * @platform macos windows
   */
  delayHoverIn?: number | null;

  /**
   * Duration to wait after hover out before calling `onHoverOut`.
   * @platform macos windows
   */
  delayHoverOut?: number | null;

  /**
   * Duration (in milliseconds) from `onPressIn` before `onLongPress` is called.
   */
  delayLongPress?: null | number;

  /**
   * Whether the press behavior is disabled.
   */
  disabled?: null | boolean;

  /**
   * Additional distance outside of this view in which a press is detected.
   */
  hitSlop?: null | Insets | number;

  /**
   * Additional distance outside of this view in which a touch is considered a
   * press before `onPressOut` is triggered.
   */
  pressRetentionOffset?: null | Insets | number;

  /**
   * If true, doesn't play system sound on touch.
   */
  android_disableSound?: null | boolean;

  /**
   * Enables the Android ripple effect and configures its color.
   */
  android_ripple?: null | PressableAndroidRippleConfig;

  /**
   * Used only for documentation or testing (e.g. snapshot testing).
   */
  testOnly_pressed?: null | boolean;

  /**
   * Either view styles or a function that receives a boolean reflecting whether
   * the component is currently pressed and returns view styles.
   */
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

  /**
   * Duration (in milliseconds) to wait after press down before calling onPressIn.
   */
  unstable_pressDelay?: number;
}