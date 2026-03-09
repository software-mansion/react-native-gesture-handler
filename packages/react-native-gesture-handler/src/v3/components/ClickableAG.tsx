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

  const shouldUseNativeRipple = useMemo(
    () =>
      hasFeedback &&
      Platform.OS === 'android' &&
      feedbackTarget === 'underlay' &&
      feedbackType === 'opacity-increase',
    [hasFeedback, feedbackTarget, feedbackType]
  );

  const canAnimate = useMemo(
    () => hasFeedback && !shouldUseNativeRipple,
    [hasFeedback, shouldUseNativeRipple]
  );

  const startOpacity =
    feedbackType === 'opacity-increase'
      ? feedbackTarget === 'component'
        ? 0.01
        : 0
      : 1;

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

  const { shellStyle, visualStyle } = useMemo(() => {
    const flattened = StyleSheet.flatten(style ?? {}) as any;
    if (feedbackTarget !== 'component') {
      return { shellStyle: flattened, visualStyle: {} };
    }

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
  }, [style, feedbackTarget]);

  const backgroundDecorationColor = useMemo(() => {
    if (underlayColor) {
      return underlayColor;
    }
    if (feedbackTarget === 'component') {
      return (visualStyle.backgroundColor as string) ?? 'transparent';
    }
    return 'black';
  }, [underlayColor, feedbackTarget, visualStyle.backgroundColor]);

  const backgroundAnimatedStyle = useMemo(() => {
    if (!canAnimate || feedbackTarget !== 'underlay') {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, activeOpacity as number],
      }),
      backgroundColor: backgroundDecorationColor,
      borderRadius: shellStyle.borderRadius,
      borderTopLeftRadius: shellStyle.borderTopLeftRadius,
      borderTopRightRadius: shellStyle.borderTopRightRadius,
      borderBottomLeftRadius: shellStyle.borderBottomLeftRadius,
      borderBottomRightRadius: shellStyle.borderBottomRightRadius,
    };
  }, [
    canAnimate,
    feedbackTarget,
    activeOpacity,
    activeState,
    startOpacity,
    backgroundDecorationColor,
    shellStyle,
  ]);

  const componentAnimatedStyle = useMemo(() => {
    if (feedbackTarget !== 'component' || !canAnimate) {
      return {};
    }

    return {
      flex: 1,
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, activeOpacity as number],
      }),
    };
  }, [feedbackTarget, canAnimate, activeOpacity, activeState, startOpacity]);

  const ButtonComponent = hasFeedback ? AnimatedRawButton : RawButton;

  return (
    <ButtonComponent
      {...rest}
      style={[
        shellStyle,
        feedbackTarget === 'component' &&
          canAnimate && { backgroundColor: 'transparent' },
      ]}
      borderless={borderless ?? feedbackTarget === 'component'}
      rippleColor={underlayColor as any}
      ref={ref ?? null}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      {feedbackTarget === 'component' && canAnimate ? (
        <Animated.View style={[visualStyle, componentAnimatedStyle]}>
          {children}
        </Animated.View>
      ) : (
        <>
          {feedbackTarget === 'underlay' && canAnimate && (
            <Animated.View
              style={[btnStyles.underlay, backgroundAnimatedStyle]}
            />
          )}
          {children}
        </>
      )}
    </ButtonComponent>
  );
};
