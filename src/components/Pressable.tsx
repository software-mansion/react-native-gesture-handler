import React from 'react';
import {
  View,
  AccessibilityProps,
  ColorValue,
  Insets,
  NativeSyntheticEvent,
  StyleProp,
  TargetedEvent,
  ViewProps,
  ViewStyle,
  StyleSheet,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureStateChangeEvent,
  GestureTouchEvent,
  LongPressGestureHandlerEventPayload,
} from '../.';
import { HoverGestureHandlerEventPayload } from '../handlers/gestures/hoverGesture';

// const hoverEventToMouseEvent = (
//   hoverEvent: GestureStateChangeEvent<HoverGestureHandlerEventPayload>,
//   previousHoverEvent?: GestureStateChangeEvent<HoverGestureHandlerEventPayload>
// ): MouseEvent => {
//   const mouseEvent: MouseEvent = {
//     altKey: false,
//     button: 0, // which button activated event
//     buttons: 1, // bitmask for all buttons
//     clientX: hoverEvent.absoluteX,
//     clientY: hoverEvent.absoluteY,
//     ctrlKey: false,
//     layerX: hoverEvent.absoluteX, // non_standard! poor docs!
//     layerY: hoverEvent.absoluteY, // non_standard! poor docs!
//     metaKey: false,
//     movementX:
//       hoverEvent.absoluteX -
//       (previousHoverEvent?.absoluteX ?? hoverEvent.absoluteX),
//     movementY:
//       hoverEvent.absoluteY -
//       (previousHoverEvent?.absoluteY ?? hoverEvent.absoluteY),
//     offsetX: hoverEvent.x,
//     offsetY: hoverEvent.y,
//     pageX: hoverEvent.absoluteX,
//     pageY: hoverEvent.absoluteY,
//     relatedTarget: null, // add target ref
//     screenX: hoverEvent.absoluteX,
//     screenY: hoverEvent.absoluteY,
//     shiftKey: false,
//     x: hoverEvent.absoluteX,
//     y: hoverEvent.absoluteY,
//     getModifierState: () => false,
//     initMouseEvent: () => null,
//   };

//   return mouseEvent;
// };

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
      ) => void)
    | undefined;

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?:
    | null
    | ((
        event: GestureStateChangeEvent<HoverGestureHandlerEventPayload>
      ) => void)
    | undefined;

  /**
   * Called when a single tap gesture is detected.
   */
  onPress?: null | ((event: GestureTouchEvent) => void) | undefined;

  /**
   * Called when a touch is engaged before `onPress`.
   */
  onPressIn?: null | ((event: GestureTouchEvent) => void) | undefined;

  /**
   * Called when a touch is released before `onPress`.
   */
  onPressOut?: null | ((event: GestureTouchEvent) => void) | undefined;

  /**
   * Called when a long-tap gesture is detected.
   */
  onLongPress?:
    | null
    | ((
        event: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>
      ) => void)
    | undefined;

  /**
   * Called after the element loses focus.
   * @platform macos windows
   */
  onBlur?:
    | null
    | ((event: NativeSyntheticEvent<TargetedEvent>) => void)
    | undefined;

  /**
   * Called after the element is focused.
   * @platform macos windows
   */
  onFocus?:
    | null
    | ((event: NativeSyntheticEvent<TargetedEvent>) => void)
    | undefined;

  /**
   * Either children or a render prop that receives a boolean reflecting whether
   * the component is currently pressed.
   */
  children?:
    | React.ReactNode
    | ((state: PressableStateCallbackType) => React.ReactNode)
    | undefined;

  /**
   * Whether a press gesture can be interrupted by a parent gesture such as a
   * scroll event. Defaults to true.
   */
  cancelable?: null | boolean | undefined;

  /**
   * Duration to wait after hover in before calling `onHoverIn`.
   * @platform macos windows
   */
  delayHoverIn?: number | null | undefined;

  /**
   * Duration to wait after hover out before calling `onHoverOut`.
   * @platform macos windows
   */
  delayHoverOut?: number | null | undefined;

  /**
   * Duration (in milliseconds) from `onPressIn` before `onLongPress` is called.
   */
  delayLongPress?: null | number | undefined;

  /**
   * Whether the press behavior is disabled.
   */
  disabled?: null | boolean | undefined;

  /**
   * Additional distance outside of this view in which a press is detected.
   */
  hitSlop?: null | Insets | number | undefined;

  /**
   * Additional distance outside of this view in which a touch is considered a
   * press before `onPressOut` is triggered.
   */
  pressRetentionOffset?: null | Insets | number | undefined;

  /**
   * If true, doesn't play system sound on touch.
   */
  android_disableSound?: null | boolean | undefined;

  /**
   * Enables the Android ripple effect and configures its color.
   */
  android_ripple?: null | PressableAndroidRippleConfig | undefined;

  /**
   * Used only for documentation or testing (e.g. snapshot testing).
   */
  testOnly_pressed?: null | boolean | undefined;

  /**
   * Either view styles or a function that receives a boolean reflecting whether
   * the component is currently pressed and returns view styles.
   */
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
    | undefined;

  /**
   * Duration (in milliseconds) to wait after press down before calling onPressIn.
   */
  unstable_pressDelay?: number | undefined;
}

export default function Pressable(props: PressableProps) {
  const touch = Gesture.Tap()
    .onTouchesDown((event) => {
      props.onPressIn?.(event);
    })
    .onTouchesUp((event) => {
      props.onPressOut?.(event);
    });

  const press = Gesture.LongPress().onEnd((event, success) => {
    if (success) {
      props.onLongPress?.(event);
    }
  });

  const hover = Gesture.Hover()
    .onBegin((event) => {
      props.onHoverIn?.(event);
    })
    .onEnd((event) => {
      props.onHoverOut?.(event);
    });

  // onBlur and onFocus don't exist in the docs

  touch.hitSlop(props.hitSlop);
  hover.hitSlop(props.hitSlop);

  // todo: add props.pressRetentionOffset to touch and check if relative to pressable or to hitSlop

  touch.enabled(!props.disabled);
  hover.enabled(!props.disabled);

  const gesture = Gesture.Race(hover, press, touch);

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <View
          style={[
            styles.container,
            typeof props.style === 'function'
              ? props.style({ pressed: false })
              : props.style,
          ]}>
          {typeof props.children === 'function'
            ? props.children({ pressed: false })
            : props.children}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 'auto',
    height: 'auto',
  },
});
