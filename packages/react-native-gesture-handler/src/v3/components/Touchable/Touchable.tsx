import React, { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

import type { ButtonProps } from '../../../components/GestureHandlerButton';
import GestureHandlerButton from '../../../components/GestureHandlerButton';
import createNativeWrapper from '../../createNativeWrapper';
import type {
  CallbackEventType,
  EndCallbackEventType,
  TouchableProps,
} from './TouchableProps';

const TouchableButton = createNativeWrapper<
  React.ComponentRef<typeof GestureHandlerButton>,
  ButtonProps
>(GestureHandlerButton, {
  shouldCancelWhenOutside: true,
  shouldActivateOnStart: false,
  disallowInterruption: true,
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

  const onActivate = useCallback((e: CallbackEventType) => {
    if (!e.pointerInside && longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const onDeactivate = useCallback(
    (e: EndCallbackEventType) => {
      if (!e.canceled && !longPressDetected.current) {
        onPress?.(e.pointerInside);
      }
    },
    [onPress]
  );

  const onFinalize = useCallback(
    (e: EndCallbackEventType) => {
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
