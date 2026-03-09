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
}

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton);

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor,
    activeOpacity,
    feedbackTarget,
    feedbackType,
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
  const startOpacity = feedbackType === 'opacity-increase' ? 0 : 1;

  const shouldAnimateOverlay = useMemo(
    () => hasFeedback && feedbackTarget === 'underlay',
    [feedbackTarget, hasFeedback]
  );

  const shouldAnimateComponent = useMemo(
    () => hasFeedback && feedbackTarget === 'component',
    [hasFeedback, feedbackTarget]
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

  const canAnimate = shouldAnimateComponent || shouldAnimateOverlay;

  const activeState = useRef(new Animated.Value(0)).current;

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

      if (success && !longPressDetected.current) {
        onPress?.(e.pointerInside);
      }
    },
    [onActiveStateChange, onPress]
  );

  const onFinalize = useCallback(
    (_e: CallbackEventType) => {
      if (canAnimate) {
        activeState.setValue(0);
      }

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [activeState, canAnimate]
  );

  const { shellStyle, visualStyle } = useMemo(() => {
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
      shellStyle: {
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

  const backgroundDecorationColor = underlayColor ?? 'black';

  const backgroundAnimatedStyle = useMemo(() => {
    return shouldAnimateOverlay
      ? {
          opacity: activeState.interpolate({
            inputRange: [0, 1],
            outputRange: [startOpacity, activeOpacity as number],
          }),
          backgroundColor: backgroundDecorationColor,
          borderRadius: visualStyle.borderRadius,
          borderTopLeftRadius: visualStyle.borderTopLeftRadius,
          borderTopRightRadius: visualStyle.borderTopRightRadius,
          borderBottomLeftRadius: visualStyle.borderBottomLeftRadius,
          borderBottomRightRadius: visualStyle.borderBottomRightRadius,
        }
      : {};
  }, [
    activeOpacity,
    startOpacity,
    backgroundDecorationColor,
    visualStyle,
    shouldAnimateOverlay,
    activeState,
  ]);

  const componentAnimatedStyle = useMemo(() => {
    if (feedbackTarget !== 'component' || !canAnimate) {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, activeOpacity as number],
      }),
    };
  }, [feedbackTarget, canAnimate, activeOpacity, activeState, startOpacity]);

  const rippleProps = shouldUseNativeRipple
    ? {
        rippleColor: rippleColor ?? 'black',
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
        shellStyle,
        visualStyle,
        feedbackTarget === 'component' && canAnimate && componentAnimatedStyle,
      ]}
      {...rippleProps}
      ref={ref ?? null}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      <>
        {feedbackTarget === 'underlay' ? (
          <Animated.View
            style={[btnStyles.underlay, backgroundAnimatedStyle]}
          />
        ) : null}
        {children}
      </>
    </ButtonComponent>
  );
};

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});
