import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { RawButton } from '../GestureButtons';
import {
  CallbackEventType,
  ClickableAnimationTarget,
  ClickableOpacityMode,
  ClickableProps,
} from './ClickableProps';

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton);

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor,
    activeOpacity,
    animationTarget,
    opacityMode,
    borderless,
    foreground,
    rippleColor,
    rippleRadius,
    delayLongPress = 600,
    onLongPress,
    onPress,
    onActiveStateChange,
    style,
    children,
    ref,
    ...rest
  } = props;

  const { layoutStyle, visualStyle } = useMemo(() => {
    const flattened = StyleSheet.flatten(style ?? {});

    const {
      margin,
      marginVertical,
      marginHorizontal,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      position,
      top,
      bottom,
      left,
      right,
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      flex,
      flexGrow,
      flexShrink,
      flexBasis,
      alignSelf,
      ...visuals
    } = flattened;

    return {
      layoutStyle: {
        margin,
        marginVertical,
        marginHorizontal,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        position,
        top,
        bottom,
        left,
        right,
        width,
        height,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        flex,
        flexGrow,
        flexShrink,
        flexBasis,
        alignSelf,
      },
      visualStyle: visuals,
    };
  }, [style]);

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
  }, [delayLongPress, onLongPress, wrappedLongPress]);

  const hasFeedback = activeOpacity !== undefined;
  const startOpacity = opacityMode === ClickableOpacityMode.INCREASE ? 0 : 1;

  const shouldAnimateUnderlay = useMemo(
    () => hasFeedback && animationTarget === ClickableAnimationTarget.UNDERLAY,
    [animationTarget, hasFeedback]
  );

  const shouldAnimateComponent = useMemo(
    () => hasFeedback && animationTarget === ClickableAnimationTarget.COMPONENT,
    [hasFeedback, animationTarget]
  );

  const shouldUseNativeRipple = useMemo(
    () =>
      Platform.OS === 'android' &&
      (borderless !== undefined ||
        foreground !== undefined ||
        rippleColor !== undefined ||
        rippleRadius !== undefined),
    [borderless, foreground, rippleColor, rippleRadius]
  );

  const usesJSAnimation = shouldAnimateComponent || shouldAnimateUnderlay;

  const animatedValue = useRef(new Animated.Value(0)).current;

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      if (Platform.OS === 'android' && e.pointerInside) {
        startLongPressTimer();

        if (usesJSAnimation) {
          animatedValue.setValue(1);
        }
      }
    },
    [startLongPressTimer, usesJSAnimation, animatedValue]
  );

  const onActivate = useCallback(
    (e: CallbackEventType) => {
      onActiveStateChange?.(true);

      if (usesJSAnimation && Platform.OS !== 'android') {
        animatedValue.setValue(1);
      }

      if (Platform.OS !== 'android' && e.pointerInside) {
        startLongPressTimer();
      }

      if (!e.pointerInside && longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [usesJSAnimation, onActiveStateChange, animatedValue, startLongPressTimer]
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
      if (usesJSAnimation) {
        animatedValue.setValue(0);
      }

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [animatedValue, usesJSAnimation]
  );

  const underlayAnimatedStyle = useMemo(
    () =>
      shouldAnimateUnderlay
        ? {
            opacity: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [startOpacity, activeOpacity as number],
            }),
            backgroundColor: underlayColor ?? 'black',
            borderRadius: visualStyle.borderRadius,
            borderTopLeftRadius: visualStyle.borderTopLeftRadius,
            borderTopRightRadius: visualStyle.borderTopRightRadius,
            borderBottomLeftRadius: visualStyle.borderBottomLeftRadius,
            borderBottomRightRadius: visualStyle.borderBottomRightRadius,
          }
        : {},
    [
      activeOpacity,
      startOpacity,
      underlayColor,
      visualStyle,
      shouldAnimateUnderlay,
      animatedValue,
    ]
  );

  const componentAnimatedStyle = useMemo(
    () =>
      animationTarget === ClickableAnimationTarget.COMPONENT && usesJSAnimation
        ? {
            opacity: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [startOpacity, activeOpacity as number],
            }),
          }
        : {},
    [
      animationTarget,
      usesJSAnimation,
      activeOpacity,
      animatedValue,
      startOpacity,
    ]
  );

  const rippleProps = shouldUseNativeRipple
    ? {
        rippleColor,
        rippleRadius,
        borderless,
        foreground,
      }
    : {
        rippleColor: 'transparent',
      };

  const ButtonComponent = hasFeedback ? AnimatedRawButton : RawButton;

  return (
    <ButtonComponent
      {...rest}
      style={[
        layoutStyle,
        visualStyle,
        animationTarget === ClickableAnimationTarget.COMPONENT &&
          usesJSAnimation &&
          componentAnimatedStyle,
      ]}
      {...rippleProps}
      ref={ref ?? null}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      <>
        {animationTarget === ClickableAnimationTarget.UNDERLAY ? (
          <Animated.View style={[styles.underlay, underlayAnimatedStyle]} />
        ) : null}
        {children}
      </>
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
