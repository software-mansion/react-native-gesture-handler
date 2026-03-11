import React, { useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { RawButton } from '../GestureButtons';
import {
  CallbackEventType,
  ClickableAnimationTarget,
  ClickableOpacityMode,
  ClickableProps,
} from './ClickableProps';

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton);
const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor,
    initialOpacity,
    activeOpacity,
    opacityMode,
    animationTarget,
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

  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const animatedValue = useRef(new Animated.Value(0)).current;

  const hasFeedback = activeOpacity !== undefined;
  const startOpacity =
    initialOpacity ?? (opacityMode === ClickableOpacityMode.INCREASE ? 0 : 1);

  const shouldAnimateUnderlay =
    hasFeedback && animationTarget === ClickableAnimationTarget.UNDERLAY;
  const shouldAnimateComponent =
    hasFeedback && animationTarget === ClickableAnimationTarget.COMPONENT;
  const shouldUseNativeRipple = isAndroid && androidRipple !== undefined;

  const usesJSAnimation = shouldAnimateComponent || shouldAnimateUnderlay;

  const wrappedLongPress = () => {
    longPressDetected.current = true;
    onLongPress?.();
  };

  const startLongPressTimer = () => {
    if (onLongPress && !longPressTimeout.current) {
      longPressDetected.current = false;
      longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
    }
  };

  const onBegin = (e: CallbackEventType) => {
    if (isAndroid && e.pointerInside) {
      startLongPressTimer();

      if (usesJSAnimation) {
        animatedValue.setValue(1);
      }
    }
  };

  const onActivate = (e: CallbackEventType) => {
    onActiveStateChange?.(true);

    if (usesJSAnimation && !isAndroid) {
      animatedValue.setValue(1);
    }

    if (!isAndroid && e.pointerInside) {
      startLongPressTimer();
    }

    if (!e.pointerInside && longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  };

  const onDeactivate = (e: CallbackEventType, success: boolean) => {
    onActiveStateChange?.(false);

    if (success && !longPressDetected.current) {
      onPress?.(e.pointerInside);
    }
  };

  const onFinalize = (_e: CallbackEventType) => {
    if (usesJSAnimation) {
      animatedValue.setValue(0);
    }

    if (longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  };

  const underlayAnimatedStyle = useMemo(() => {
    if (!shouldAnimateUnderlay) {
      return undefined;
    }
    const resolvedStyle = StyleSheet.flatten(style ?? {});
    return {
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, activeOpacity],
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
    startOpacity,
    activeOpacity,
    underlayColor,
    animatedValue,
  ]);

  const componentAnimatedStyle = useMemo(
    () =>
      shouldAnimateComponent
        ? {
            opacity: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [startOpacity, activeOpacity],
            }),
          }
        : undefined,
    [shouldAnimateComponent, activeOpacity, animatedValue, startOpacity]
  );

  const rippleProps = shouldUseNativeRipple
    ? {
        rippleColor: androidRipple?.color,
        rippleRadius: androidRipple?.radius,
        borderless: androidRipple?.borderless,
        foreground: androidRipple?.foreground,
      }
    : TRANSPARENT_RIPPLE;

  const ButtonComponent = hasFeedback ? AnimatedRawButton : RawButton;

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
