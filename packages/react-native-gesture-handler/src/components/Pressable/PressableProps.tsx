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
import { AnyGesture } from '../../v3/types';

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

export interface LegacyPressableProps extends CommonPressableProps {
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
}

export interface PressableProps extends CommonPressableProps {
  /**
   * A gesture object or an array of gesture objects containing the configuration and callbacks to be
   * used with the Pressable's gesture handlers.
   */
  simultaneousWith?: AnyGesture;

  /**
   * A gesture object or an array of gesture objects containing the configuration and callbacks to be
   * used with the Pressable's gesture handlers.
   */
  requireToFail?: AnyGesture;

  /**
   * A gesture object or an array of gesture objects containing the configuration and callbacks to be
   * used with the Pressable's gesture handlers.
   */
  block?: AnyGesture;
}

interface CommonPressableProps
  extends AccessibilityProps,
    Omit<ViewProps, 'children' | 'style' | 'hitSlop'> {
  /**
   * Called when pointer is hovering over the element.
   */
  onHoverIn?: null | ((event: PressableEvent) => void);

  /**
   * Called when pointer stops hovering over the element.
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
   * Called immediately after pointer has been down for at least `delayLongPress` milliseconds (`500` ms by default).
   */
  onLongPress?: null | ((event: PressableEvent) => void);

  /**
   * A reference to the pressable element.
   */
  ref?: React.Ref<View>;

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
   * Duration (in milliseconds) from `onPressIn` before `onLongPress` is called. Default value is `500` ms.
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
   * @deprecated This property is no longer used, and will be removed in the future.
   */
  dimensionsAfterResize?: PressableDimensions;
}
