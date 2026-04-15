import type { CallbackEventType, TouchableProps } from './TouchableProps';
import React, { useCallback, useRef } from 'react';
import type { ButtonProps } from '../../../components/GestureHandlerButton';
import GestureHandlerButton from '../../../components/GestureHandlerButton';
import { Platform } from 'react-native';
import createNativeWrapper from '../../createNativeWrapper';

const TouchableButton = createNativeWrapper<
  React.ComponentRef<typeof GestureHandlerButton>,
  ButtonProps
>(GestureHandlerButton, {
  shouldCancelWhenOutside: true,
  shouldActivateOnStart: false,
});

const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };

export const Touchable = (props: TouchableProps) => {
  const {
    underlayColor = 'black',
    defaultUnderlayOpacity = 0,
    defaultOpacity = 1,
    androidRipple,
    delayLongPress = 600,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    onActiveStateChange,
    children,
    disabled = false,
    ref,
    ...rest
  } = props;

  const shouldUseNativeRipple = isAndroid && androidRipple !== undefined;

  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const wrappedLongPress = useCallback(() => {
    longPressDetected.current = true;
    onLongPress?.();
  }, [onLongPress]);

  const startLongPressTimer = useCallback(() => {
    longPressDetected.current = false;

    if (onLongPress && !longPressTimeout.current) {
      longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
    }
  }, [onLongPress, delayLongPress, wrappedLongPress]);

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      if (!e.pointerInside) {
        return;
      }

      onPressIn?.(e);
      startLongPressTimer();
    },
    [startLongPressTimer, onPressIn]
  );

  const onActivate = useCallback(
    (e: CallbackEventType) => {
      onActiveStateChange?.(true);

      if (!e.pointerInside && longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [onActiveStateChange]
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
    (e: CallbackEventType) => {
      onPressOut?.(e);

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [onPressOut]
  );

  const rippleProps = shouldUseNativeRipple
    ? {
        rippleColor: androidRipple?.color,
        rippleRadius: androidRipple?.radius,
        borderless: androidRipple?.borderless,
        foreground: androidRipple?.foreground,
      }
    : TRANSPARENT_RIPPLE;

  return (
    <TouchableButton
      {...rest}
      {...rippleProps}
      ref={ref ?? null}
      enabled={!disabled}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}
      defaultOpacity={defaultOpacity}
      defaultUnderlayOpacity={defaultUnderlayOpacity}
      underlayColor={underlayColor}>
      {children}
    </TouchableButton>
  );
};
