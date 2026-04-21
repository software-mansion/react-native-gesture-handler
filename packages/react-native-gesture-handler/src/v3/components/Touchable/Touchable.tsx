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
});

const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };

enum PointerState {
  UNKNOWN,
  INSIDE,
  OUTSIDE,
}

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
    cancelOnLeave = true,
    ref,
    ...rest
  } = props;

  const shouldUseNativeRipple = isAndroid && androidRipple !== undefined;

  const pointerState = useRef<PointerState>(PointerState.UNKNOWN);
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
        pointerState.current = PointerState.OUTSIDE;
        return;
      }

      onPressIn?.(e);
      startLongPressTimer();

      pointerState.current = PointerState.INSIDE;
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
      if (!e.canceled && !longPressDetected.current && e.pointerInside) {
        onPress?.(e);
      }
    },
    [onPress]
  );

  const onFinalize = useCallback(
    (e: EndCallbackEventType) => {
      if (pointerState.current === PointerState.INSIDE) {
        onPressOut?.(e);
      }

      pointerState.current = PointerState.UNKNOWN;

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [onPressOut]
  );

  const onUpdate = useCallback(
    (e: CallbackEventType) => {
      if (pointerState.current === PointerState.UNKNOWN) {
        return;
      }

      if (e.pointerInside) {
        if (pointerState.current === PointerState.OUTSIDE) {
          onPressIn?.(e);
        }
        pointerState.current = PointerState.INSIDE;
      } else {
        if (pointerState.current === PointerState.INSIDE) {
          onPressOut?.(e);
        }
        pointerState.current = PointerState.OUTSIDE;
      }
    },
    [onPressIn, onPressOut]
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
      onUpdate={onUpdate}
      defaultOpacity={defaultOpacity}
      defaultUnderlayOpacity={defaultUnderlayOpacity}
      underlayColor={underlayColor}
      shouldCancelWhenOutside={cancelOnLeave}>
      {children}
    </TouchableButton>
  );
};
