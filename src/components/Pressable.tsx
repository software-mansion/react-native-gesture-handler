import React, { useRef } from 'react';
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
  TouchData,
} from '../.';
import { HoverGestureHandlerEventPayload } from '../handlers/gestures/hoverGesture';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

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
  onPress?: null | ((event: GestureTouchEvent) => void);

  /**
   * Called when a touch is engaged before `onPress`.
   */
  onPressIn?: null | ((event: GestureTouchEvent) => void);

  /**
   * Called when a touch is released before `onPress`.
   */
  onPressOut?: null | ((event: GestureTouchEvent) => void);

  /**
   * Called when a long-tap gesture is detected.
   */
  onLongPress?:
    | null
    | ((
        event: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>
      ) => void);

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

function touchWithinBounds(touch: TouchData, bounds: Insets): boolean {
  const leftbound = bounds.left ? bounds.left < touch.absoluteX : true;
  const rightbound = bounds.right ? bounds.right > touch.absoluteX : true;
  const bottombound = bounds.bottom ? bounds.bottom < touch.absoluteY : true;
  const topbound = bounds.top ? bounds.top > touch.absoluteY : true;

  return leftbound && rightbound && topbound && bottombound;
}

export default function Pressable(props: PressableProps) {
  const previousTouchData = useRef<TouchData[] | null>(null);
  const pressableRef = useRef<View>(null);

  const pressRetentionOffset: Insets | null | undefined =
    typeof props.pressRetentionOffset === 'number'
      ? {
          top: props.pressRetentionOffset,
          left: props.pressRetentionOffset,
          bottom: props.pressRetentionOffset,
          right: props.pressRetentionOffset,
        }
      : props.pressRetentionOffset;

  const touchGesture = Gesture.Native()
    .onTouchesDown((event) => {
      // note: hitslop checking support is built in
      props.onPressIn?.(event);
      previousTouchData.current = event.allTouches;
    })
    .onTouchesUp((event) => {
      // doesn't call onPressOut untill the last pointer leaves, while within bounds
      if (event.allTouches.length > 1) {
        previousTouchData.current = event.allTouches;
        return;
      }

      if (!pressRetentionOffset) {
        // we cannot just set shouldCancelWhenOutside,
        // that would disablepressRetentionOffset
        pressableRef.current?.measure((x, y, width, height) => {
          if (
            previousTouchData.current?.find((touch) =>
              touchWithinBounds(
                touch,
                { bottom: 0, top: 0, left: 0, right: 0 },
                {
                  bottom: y,
                  top: y + height,
                  left: x,
                  right: x + width,
                }
              )
            )
          ) {
            props.onPressOut?.(event);
          }
        });
        previousTouchData.current = event.allTouches;
        return;
      }

      pressableRef.current?.measure((x, y, width, height) => {
        console.log(x, y, width, height);
        const pressableDimensions = {
          bottom: y,
          top: y + height,
          left: x,
          right: x + width,
        } as Insets;

        if (
          previousTouchData.current?.find((touch) =>
            touchWithinBounds(touch, pressRetentionOffset, pressableDimensions)
          )
        ) {
          props.onPressOut?.(event);
        }
      });
      previousTouchData.current = event.allTouches;
    });

  const pressGesture = Gesture.LongPress().onEnd((event, success) => {
    if (success) {
      props.onLongPress?.(event);
    }
  });

  const hoverGesture = Gesture.Hover()
    .onBegin((event) => {
      setTimeout(
        () => props.onHoverIn?.(event),
        props.delayHoverIn ?? DEFAULT_HOVER_DELAY
      );
    })
    .onEnd((event) => {
      setTimeout(
        () => props.onHoverOut?.(event),
        props.delayHoverOut ?? DEFAULT_HOVER_DELAY
      );
    });

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

  // onBlur and onFocus don't exist in the docs

  touchGesture.hitSlop(props.hitSlop);
  pressGesture.hitSlop(props.hitSlop);
  hoverGesture.hitSlop(props.hitSlop);

  // add props.pressRetentionOffset, according to docs, they're relative to pressable, not hitSlop

  touchGesture.enabled(props.disabled !== false);
  pressGesture.enabled(props.disabled !== false);
  hoverGesture.enabled(props.disabled !== false);

  const gesture = Gesture.Simultaneous(
    hoverGesture,
    pressGesture,
    touchGesture
  );

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <View
          ref={pressableRef}
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
