import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { RawButton } from './GestureButtons';
import type { BaseButtonProps } from './GestureButtonsProps';
import type { GestureEvent } from '../types';
import type { NativeHandlerData } from '../hooks/gestures/native/NativeTypes';

type CallbackEventType = GestureEvent<NativeHandlerData>;

export interface ClickableProps extends BaseButtonProps {
  /**
   * Background color that will be dimmed when button is in active state.
   */
  underlayColor?: string | undefined;

  /**
   * Opacity applied to the underlay or button when it is in an active state.
   * If not provided, no visual feedback will be applied.
   */
  activeOpacity?: number | undefined;

  /**
   * If true, the whole component's opacity will be decreased when pressed.
   * If false (default), an underlay with underlayColor will be shown.
   */
  shouldDecreaseOpacity?: boolean | undefined;

  /**
   * If true, the button will have a borderless ripple effect on Android.
   * On iOS, this has no effect.
   */
  borderless?: boolean | undefined;
}

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton);

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor = 'black',
    activeOpacity,
    shouldDecreaseOpacity = false,
    delayLongPress = 600,
    onLongPress,
    onPress,
    onActiveStateChange,
    style,
    children,
    borderless,
    ...rest
  } = props;

  const hasFeedback = activeOpacity !== undefined;

  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const activeState = useRef(new Animated.Value(0)).current;

  const wrappedLongPress = useCallback(() => {
    longPressDetected.current = true;
    onLongPress?.();
  }, [onLongPress]);

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      if (Platform.OS === 'android' && e.pointerInside) {
        longPressDetected.current = false;
        if (onLongPress) {
          longPressTimeout.current = setTimeout(
            wrappedLongPress,
            delayLongPress
          );
        }
      }
    },
    [delayLongPress, onLongPress, wrappedLongPress]
  );

  const onActivate = useCallback(
    (e: CallbackEventType) => {
      onActiveStateChange?.(true);

      const canAnimate = shouldDecreaseOpacity
        ? Platform.OS === 'ios' // Borderless-like animates on iOS
        : Platform.OS !== 'android'; // Rect-like animates everywhere except Android (ripple takes over)

      if (hasFeedback && canAnimate) {
        activeState.setValue(1);
      }

      if (Platform.OS !== 'android' && e.pointerInside) {
        longPressDetected.current = false;
        if (onLongPress) {
          longPressTimeout.current = setTimeout(
            wrappedLongPress,
            delayLongPress
          );
        }
      }

      if (!e.pointerInside && longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [
      shouldDecreaseOpacity,
      hasFeedback,
      delayLongPress,
      onActiveStateChange,
      onLongPress,
      wrappedLongPress,
      activeState,
    ]
  );

  const onDeactivate = useCallback(
    (e: CallbackEventType, success: boolean) => {
      onActiveStateChange?.(false);

      const canAnimate = shouldDecreaseOpacity
        ? Platform.OS === 'ios'
        : Platform.OS !== 'android';

      if (hasFeedback && canAnimate) {
        activeState.setValue(0);
      }

      if (success && !longPressDetected.current) {
        onPress?.(e.pointerInside);
      }
    },
    [
      shouldDecreaseOpacity,
      hasFeedback,
      onActiveStateChange,
      onPress,
      activeState,
    ]
  );

  const onFinalize = useCallback((_e: CallbackEventType) => {
    if (longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const resolvedStyle = useMemo(() => StyleSheet.flatten(style ?? {}), [style]);

  const underlayAnimatedStyle = useMemo(() => {
    if (shouldDecreaseOpacity || !hasFeedback || activeOpacity === undefined) {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [0, activeOpacity],
      }),
      backgroundColor: underlayColor,
      borderRadius: resolvedStyle.borderRadius,
      borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
      borderTopRightRadius: resolvedStyle.borderTopRightRadius,
      borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
      borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
    };
  }, [
    shouldDecreaseOpacity,
    hasFeedback,
    activeOpacity,
    activeState,
    underlayColor,
    resolvedStyle,
  ]);

  const buttonAnimatedStyle = useMemo(() => {
    if (
      !shouldDecreaseOpacity ||
      !hasFeedback ||
      activeOpacity === undefined ||
      Platform.OS !== 'ios'
    ) {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [1, activeOpacity],
      }),
    };
  }, [shouldDecreaseOpacity, hasFeedback, activeOpacity, activeState]);

  const ButtonComponent = (
    hasFeedback ? AnimatedRawButton : RawButton
  ) as React.ElementType;

  return (
    <ButtonComponent
      style={[
        resolvedStyle,
        Platform.OS === 'ios' && { cursor: undefined },
        hasFeedback && buttonAnimatedStyle,
      ]}
      borderless={borderless ?? shouldDecreaseOpacity}
      {...rest}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      {!shouldDecreaseOpacity && hasFeedback && (
        <Animated.View style={[btnStyles.underlay, underlayAnimatedStyle]} />
      )}
      {children}
    </ButtonComponent>
  );
};
