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
   * Determines what should be animated.
   * - 'underlay' (default): an additional view rendered behind children.
   * - 'component': the whole button.
   */
  feedbackTarget?: 'underlay' | 'component' | undefined;

  /**
   * Determines the direction of the animation.
   * - 'opacity-increase' (default): opacity goes from 0 to activeOpacity.
   * - 'opacity-decrease': opacity goes from 1 to activeOpacity.
   */
  feedbackType?: 'opacity-increase' | 'opacity-decrease' | undefined;

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
    underlayColor,
    activeOpacity,
    feedbackTarget = 'underlay',
    feedbackType = 'opacity-increase',
    delayLongPress = 600,
    onLongPress,
    onPress,
    onActiveStateChange,
    style,
    children,
    borderless,
    ref,
    ...rest
  } = props;

  const hasFeedback = activeOpacity !== undefined;

  const shouldUseNativeRipple = useMemo(() => {
    return (
      hasFeedback &&
      Platform.OS === 'android' &&
      feedbackTarget === 'underlay' &&
      feedbackType === 'opacity-increase'
    );
  }, [hasFeedback, feedbackTarget, feedbackType]);

  const canAnimate = useMemo(() => {
    if (!hasFeedback) {
      return false;
    }

    if (shouldUseNativeRipple) {
      return false;
    }

    return true;
  }, [hasFeedback, shouldUseNativeRipple]);

  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const activeState = useRef(new Animated.Value(0)).current;

  const wrappedLongPress = useCallback(() => {
    longPressDetected.current = true;
    onLongPress?.();
  }, [onLongPress]);

  const startLongPressTimer = useCallback(() => {
    if (onLongPress && !longPressTimeout.current) {
      longPressDetected.current = false;
      longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
    }
  }, [delayLongPress, onLongPress, wrappedLongPress]);

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      if (Platform.OS === 'android' && e.pointerInside) {
        startLongPressTimer();

        if (canAnimate) {
          activeState.setValue(1);
        }
      }
    },
    [startLongPressTimer, canAnimate, activeState]
  );

  const onActivate = useCallback(
    (e: CallbackEventType) => {
      onActiveStateChange?.(true);

      if (canAnimate && Platform.OS !== 'android') {
        activeState.setValue(1);
      }

      if (Platform.OS !== 'android' && e.pointerInside) {
        startLongPressTimer();
      }

      if (!e.pointerInside && longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [canAnimate, onActiveStateChange, activeState, startLongPressTimer]
  );

  const onDeactivate = useCallback(
    (e: CallbackEventType, success: boolean) => {
      onActiveStateChange?.(false);

      if (canAnimate) {
        activeState.setValue(0);
      }

      if (success && !longPressDetected.current) {
        onPress?.(e.pointerInside);
      }
    },
    [canAnimate, onActiveStateChange, onPress, activeState]
  );

  const onFinalize = useCallback((_e: CallbackEventType) => {
    if (longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const resolvedStyle = useMemo(() => StyleSheet.flatten(style ?? {}), [style]);

  const underlayAnimatedStyle = useMemo(() => {
    if (feedbackTarget !== 'underlay' || !canAnimate) {
      return {};
    }

    const startOpacity = feedbackType === 'opacity-increase' ? 0 : 1;

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, activeOpacity as number],
      }),
      backgroundColor: underlayColor ?? 'black',
      borderRadius: resolvedStyle.borderRadius,
      borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
      borderTopRightRadius: resolvedStyle.borderTopRightRadius,
      borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
      borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
    };
  }, [
    feedbackTarget,
    feedbackType,
    canAnimate,
    activeOpacity,
    activeState,
    underlayColor,
    resolvedStyle,
  ]);

  const buttonAnimatedStyle = useMemo(() => {
    if (feedbackTarget !== 'component' || !canAnimate) {
      return {};
    }

    const startOpacity = feedbackType === 'opacity-increase' ? 0 : 1;

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, activeOpacity as number],
      }),
    };
  }, [feedbackTarget, feedbackType, canAnimate, activeOpacity, activeState]);

  const ButtonComponent = hasFeedback ? AnimatedRawButton : RawButton;

  return (
    <ButtonComponent
      style={[
        resolvedStyle,
        feedbackTarget === 'component' && canAnimate
          ? buttonAnimatedStyle
          : undefined,
      ]}
      borderless={borderless ?? feedbackTarget === 'component'}
      rippleColor={
        shouldUseNativeRipple ? (underlayColor as any) : 'transparent'
      }
      {...rest}
      ref={ref ?? null}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      {feedbackTarget === 'underlay' && canAnimate && (
        <Animated.View style={[btnStyles.underlay, underlayAnimatedStyle]} />
      )}
      {children}
    </ButtonComponent>
  );
};
