import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { RawButton } from '../GestureButtons';
import {
  CallbackEventType,
  ClickableAnimationTarget,
  ClickableOpacityMode,
  ClickablePreset,
  ClickableProps,
} from './ClickableProps';

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton);

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor,
    activeOpacity,
    feedbackTarget,
    opacityMode,
    preset,
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

  let targetComponent;
  let targetOpacity;
  let targetOpacityMode;

  switch (preset) {
    case ClickablePreset.RECT:
      targetComponent = ClickableAnimationTarget.UNDERLAY;
      targetOpacity = 0.105;
      targetOpacityMode = ClickableOpacityMode.INCREASE;
      break;
    case ClickablePreset.BORDERLESS:
      targetComponent = ClickableAnimationTarget.COMPONENT;
      targetOpacity = 0.3;
      targetOpacityMode = ClickableOpacityMode.DECREASE;
      break;
    default:
      targetOpacity = activeOpacity;
      targetComponent = feedbackTarget;
      targetOpacityMode = opacityMode;
      break;
  }

  const hasFeedback = targetOpacity !== undefined;
  const startOpacity =
    targetOpacityMode === ClickableOpacityMode.INCREASE ? 0 : 1;

  const shouldAnimateOverlay = useMemo(
    () => hasFeedback && targetComponent === ClickableAnimationTarget.UNDERLAY,
    [targetComponent, hasFeedback]
  );

  const shouldAnimateComponent = useMemo(
    () => hasFeedback && targetComponent === ClickableAnimationTarget.COMPONENT,
    [hasFeedback, targetComponent]
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
            outputRange: [startOpacity, targetOpacity as number],
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
    targetOpacity,
    startOpacity,
    backgroundDecorationColor,
    visualStyle,
    shouldAnimateOverlay,
    activeState,
  ]);

  const componentAnimatedStyle = useMemo(() => {
    if (targetComponent !== ClickableAnimationTarget.COMPONENT || !canAnimate) {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [startOpacity, targetOpacity as number],
      }),
    };
  }, [targetComponent, canAnimate, targetOpacity, activeState, startOpacity]);

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
        shellStyle,
        visualStyle,
        targetComponent === ClickableAnimationTarget.COMPONENT &&
          canAnimate &&
          componentAnimatedStyle,
      ]}
      {...rippleProps}
      ref={ref ?? null}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      <>
        {targetComponent === ClickableAnimationTarget.UNDERLAY ? (
          <Animated.View style={[styles.underlay, backgroundAnimatedStyle]} />
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
