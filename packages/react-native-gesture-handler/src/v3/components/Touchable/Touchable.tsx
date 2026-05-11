import React, { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

import GestureHandlerButton from '../../../components/GestureHandlerButton';
import { NativeDetector } from '../../detectors/NativeDetector';
import { useNativeGesture } from '../../hooks';
import type {
  CallbackEventType,
  EndCallbackEventType,
  TouchableProps,
} from './TouchableProps';

const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };

enum PointerState {
  UNKNOWN,
  INSIDE,
  OUTSIDE,
}

export const Touchable = (props: TouchableProps) => {
  const {
    underlayColor = 'transparent',
    defaultUnderlayOpacity = 0,
    activeUnderlayOpacity = 0.105,
    defaultOpacity = 1,
    tapAnimationDuration: tapAnimationDurationProp = 100,
    pressAndHoldAnimationDuration: pressAndHoldAnimationDurationProp = -1,
    hoverAnimationDuration: hoverAnimationDurationProp = -1,
    tapAnimationInDuration: tapAnimationInDurationProp = -1,
    tapAnimationOutDuration: tapAnimationOutDurationProp = -1,
    pressAndHoldAnimationInDuration: pressAndHoldAnimationInDurationProp = -1,
    pressAndHoldAnimationOutDuration: pressAndHoldAnimationOutDurationProp = -1,
    hoverAnimationInDuration: hoverAnimationInDurationProp = -1,
    hoverAnimationOutDuration: hoverAnimationOutDurationProp = -1,
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

  const tapAnimationDuration =
    tapAnimationDurationProp < 0 ? 0 : tapAnimationDurationProp;
  const tapAnimationInDuration =
    tapAnimationInDurationProp < 0
      ? tapAnimationDuration
      : tapAnimationInDurationProp;
  const tapAnimationOutDuration =
    tapAnimationOutDurationProp < 0
      ? tapAnimationDuration
      : tapAnimationOutDurationProp;

  const pressAndHoldAnimationInDuration =
    pressAndHoldAnimationInDurationProp >= 0
      ? pressAndHoldAnimationInDurationProp
      : pressAndHoldAnimationDurationProp >= 0
        ? pressAndHoldAnimationDurationProp
        : tapAnimationInDuration;
  const pressAndHoldAnimationOutDuration =
    pressAndHoldAnimationOutDurationProp >= 0
      ? pressAndHoldAnimationOutDurationProp
      : pressAndHoldAnimationDurationProp >= 0
        ? pressAndHoldAnimationDurationProp
        : tapAnimationOutDuration;
  const hoverAnimationInDuration =
    hoverAnimationInDurationProp >= 0
      ? hoverAnimationInDurationProp
      : hoverAnimationDurationProp >= 0
        ? hoverAnimationDurationProp
        : tapAnimationInDuration;
  const hoverAnimationOutDuration =
    hoverAnimationOutDurationProp >= 0
      ? hoverAnimationOutDurationProp
      : hoverAnimationDurationProp >= 0
        ? hoverAnimationDurationProp
        : tapAnimationOutDuration;

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

  const onFinalize = useCallback(
    (e: EndCallbackEventType) => {
      if (pointerState.current === PointerState.INSIDE) {
        onPressOut?.(e);
      }

      if (!e.canceled && !longPressDetected.current && e.pointerInside) {
        onPress?.(e);
      }

      pointerState.current = PointerState.UNKNOWN;

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [onPressOut, onPress]
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

          if (longPressTimeout.current !== undefined) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = undefined;
          }
        }
        pointerState.current = PointerState.OUTSIDE;
      }
    },
    [onPressIn, onPressOut]
  );

  const nativeGesture = useNativeGesture({
    onBegin,
    onActivate,
    onFinalize,
    onUpdate,
    hitSlop: props.hitSlop,
    testID: props.testID,
    enabled: !disabled,
    shouldCancelWhenOutside: cancelOnLeave,
    disableReanimated: true,
    shouldActivateOnStart: false,
    disallowInterruption: true,
    yieldsToContinuousGestures: true,
  });

  const rippleProps = shouldUseNativeRipple
    ? {
        rippleColor: androidRipple?.color,
        rippleRadius: androidRipple?.radius,
        borderless: androidRipple?.borderless,
        foreground: androidRipple?.foreground,
      }
    : TRANSPARENT_RIPPLE;

  return (
    <NativeDetector gesture={nativeGesture}>
      <GestureHandlerButton
        {...rest}
        {...rippleProps}
        ref={ref ?? null}
        enabled={!disabled}
        defaultOpacity={defaultOpacity}
        defaultUnderlayOpacity={defaultUnderlayOpacity}
        activeUnderlayOpacity={activeUnderlayOpacity}
        underlayColor={underlayColor}
        tapAnimationInDuration={tapAnimationInDuration}
        tapAnimationOutDuration={tapAnimationOutDuration}
        pressAndHoldAnimationInDuration={pressAndHoldAnimationInDuration}
        pressAndHoldAnimationOutDuration={pressAndHoldAnimationOutDuration}
        hoverAnimationInDuration={hoverAnimationInDuration}
        hoverAnimationOutDuration={hoverAnimationOutDuration}>
        {children}
      </GestureHandlerButton>
    </NativeDetector>
  );
};
