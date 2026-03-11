import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { RawButton } from '../GestureButtons';
import { CallbackEventType, ClickableProps } from './ClickableProps';

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton);
const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor,
    underlayInitialOpacity,
    underlayActiveOpacity,
    initialOpacity,
    activeOpacity,
    androidRipple,
    delayLongPress = 600,
    onLongPress,
    onPress,
    onActiveStateChange,
    style,
    children,
    ref,
    ...rest
  } = props;

  const animatedValue = useRef(new Animated.Value(0)).current;

  const underlayStartOpacity = underlayInitialOpacity ?? 0;
  const componentStartOpacity = initialOpacity ?? 1;

  const shouldAnimateUnderlay = underlayActiveOpacity !== undefined;
  const shouldAnimateComponent = activeOpacity !== undefined;

  const shouldUseNativeRipple = isAndroid && androidRipple !== undefined;
  const shouldUseJSAnimation = shouldAnimateComponent || shouldAnimateUnderlay;

  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const wrappedLongPress = useCallback(() => {
    longPressDetected.current = true;
    onLongPress?.();
  }, [onLongPress]);

  const startLongPressTimer = useCallback(() => {
    if (onLongPress && !longPressTimeout.current) {
      longPressDetected.current = false;
      longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
    }
  }, [onLongPress, delayLongPress, wrappedLongPress]);

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      if (isAndroid && e.pointerInside) {
        startLongPressTimer();

        if (shouldUseJSAnimation) {
          animatedValue.setValue(1);
        }
      }
    },
    [startLongPressTimer, shouldUseJSAnimation, animatedValue]
  );

  const onActivate = useCallback(
    (e: CallbackEventType) => {
      onActiveStateChange?.(true);

      if (shouldUseJSAnimation && !isAndroid) {
        animatedValue.setValue(1);
      }

      if (!isAndroid && e.pointerInside) {
        startLongPressTimer();
      }

      if (!e.pointerInside && longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [
      onActiveStateChange,
      shouldUseJSAnimation,
      animatedValue,
      startLongPressTimer,
    ]
  );

  const onDeactivate = useCallback(
    (e: CallbackEventType, success: boolean) => {
      onActiveStateChange?.(false);

      if (success && !longPressDetected.current) {
        onPress?.(e.pointerInside);
      }
    },
    [onActiveStateChange, onPress]
  );

  const onFinalize = useCallback(
    (_e: CallbackEventType) => {
      if (shouldUseJSAnimation) {
        animatedValue.setValue(0);
      }

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [shouldUseJSAnimation, animatedValue]
  );

  const underlayAnimatedStyle = useMemo(() => {
    if (!shouldAnimateUnderlay) {
      return undefined;
    }
    const resolvedStyle = StyleSheet.flatten(style ?? {});
    return {
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [underlayStartOpacity, underlayActiveOpacity],
      }),
      backgroundColor: underlayColor ?? 'black',
      borderRadius: resolvedStyle.borderRadius,
      borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
      borderTopRightRadius: resolvedStyle.borderTopRightRadius,
      borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
      borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
    };
  }, [
    shouldAnimateUnderlay,
    style,
    underlayStartOpacity,
    underlayActiveOpacity,
    underlayColor,
    animatedValue,
  ]);

  const componentAnimatedStyle = useMemo(
    () =>
      shouldAnimateComponent
        ? {
            opacity: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [componentStartOpacity, activeOpacity],
            }),
          }
        : undefined,
    [
      shouldAnimateComponent,
      activeOpacity,
      animatedValue,
      componentStartOpacity,
    ]
  );

  const rippleProps = shouldUseNativeRipple
    ? {
        rippleColor: androidRipple?.color,
        rippleRadius: androidRipple?.radius,
        borderless: androidRipple?.borderless,
        foreground: androidRipple?.foreground,
      }
    : TRANSPARENT_RIPPLE;

  const ButtonComponent = shouldUseJSAnimation ? AnimatedRawButton : RawButton;

  return (
    <ButtonComponent
      {...rest}
      style={[style, componentAnimatedStyle]}
      {...rippleProps}
      ref={ref ?? null}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      {underlayAnimatedStyle && (
        <Animated.View style={[styles.underlay, underlayAnimatedStyle]} />
      )}
      {children}
    </ButtonComponent>
  );
};

const styles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});
