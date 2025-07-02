import {
  AccessibilityProps,
  ViewProps,
  Insets,
  StyleProp,
  ViewStyle,
  PressableStateCallbackType as RNPressableStateCallbackType,
  PressableAndroidRippleConfig as RNPressableAndroidRippleConfig,
  View,
} from 'react-native';
import { RelationPropType } from '../utils';

export type PressableDimensions = { width: number; height: number };

export type PressableStateCallbackType = RNPressableStateCallbackType;
export type PressableAndroidRippleConfig = RNPressableAndroidRippleConfig;

export type InnerPressableEvent = {
  changedTouches: InnerPressableEvent[];
  identifier: number;
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  target: number;
  timestamp: number;
  touches: InnerPressableEvent[];
  force?: number;
};

export type PressableEvent = { nativeEvent: InnerPressableEvent };

export interface PressableProps
  extends AccessibilityProps,
    Omit<ViewProps, 'children' | 'style' | 'hitSlop'> {
  /**
   * Called when the hover is activated to provide visual feedback.
   */
  onHoverIn?: null | ((event: PressableEvent) => void);

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?: null | ((event: PressableEvent) => void);

  /**
   * Called when a single tap gesture is detected.
   */
  onPress?: null | ((event: PressableEvent) => void);

  /**
   * Called when a touch is engaged before `onPress`.
   */
  onPressIn?: null | ((event: PressableEvent) => void);

  /**
   * Called when a touch is released before `onPress`.
   */
  onPressOut?: null | ((event: PressableEvent) => void);

  /**
   * Called when a long-tap gesture is detected.
   */
  onLongPress?: null | ((event: PressableEvent) => void);

  /**
   * A reference to the pressable element.
   */
  ref?: React.RefObject<View>;

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
   * @platform web macos
   *
   * NOTE: not present in RN docs
   */
  delayHoverIn?: number | null;

  /**
   * Duration to wait after hover out before calling `onHoverOut`.
   * @platform web macos
   *
   * NOTE: not present in RN docs
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
   * @platform android
   */
  android_disableSound?: null | boolean;

  /**
   * Enables the Android ripple effect and configures its color.
   * @platform android
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

  /**
   * A gesture object or an array of gesture objects containing the configuration and callbacks to be
   * used with the Pressable's gesture handlers.
   */
  simultaneousWithExternalGesture?: RelationPropType;

  /**
   * A gesture object or an array of gesture objects containing the configuration and callbacks to be
   * used with the Pressable's gesture handlers.
   */
  requireExternalGestureToFail?: RelationPropType;

  /**
   * A gesture object or an array of gesture objects containing the configuration and callbacks to be
   * used with the Pressable's gesture handlers.
   */
  blocksExternalGesture?: RelationPropType;

  /**
   * Defines the dimensions of the Pressable after it's been resized.
   * This property does not affect Pressable's physical appearance.
   * Required when the Pressable is resized **and** uses pressRetentionOffset.
   */
  dimensionsAfterResize?: PressableDimensions;
}
