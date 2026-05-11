import React, { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

import GestureHandlerButton from '../../../components/GestureHandlerButton';
import { NativeDetector } from '../../detectors/NativeDetector';
import { useNativeGesture } from '../../hooks';
import type {
  AnimationDuration,
  CallbackEventType,
  EndCallbackEventType,
  TouchableProps,
} from './TouchableProps';

const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };
const DEFAULT_ANIMATION_DURATION_MS = 100;

enum PointerState {
  UNKNOWN,
  INSIDE,
  OUTSIDE,
}

function resolveAnimationDuration(value: AnimationDuration | undefined) {
  if (value === undefined) {
    const d = DEFAULT_ANIMATION_DURATION_MS;
    return {
      tapAnimationInDuration: d,
      tapAnimationOutDuration: d,
      pressAndHoldAnimationInDuration: d,
      pressAndHoldAnimationOutDuration: d,
      hoverAnimationInDuration: d,
      hoverAnimationOutDuration: d,
    };
  }

  if (typeof value === 'number') {
    return {
      tapAnimationInDuration: value,
      tapAnimationOutDuration: value,
      pressAndHoldAnimationInDuration: value,
      pressAndHoldAnimationOutDuration: value,
      hoverAnimationInDuration: value,
      hoverAnimationOutDuration: value,
    };
  }

  // The union guarantees variant 2 supplies top-level `in`/`out`, variant 3
  // supplies all three category objects — so per-category fallback to base is
  // always defined for well-typed input; the 0 fallbacks here are unreachable.
  const baseIn = 'in' in value ? value.in : 0;
  const baseOut = 'out' in value ? value.out : 0;

  return {
    tapAnimationInDuration: value.tap?.in ?? baseIn,
    tapAnimationOutDuration: value.tap?.out ?? baseOut,
    pressAndHoldAnimationInDuration: value.pressAndHold?.in ?? baseIn,
    pressAndHoldAnimationOutDuration: value.pressAndHold?.out ?? baseOut,
    hoverAnimationInDuration: value.hover?.in ?? baseIn,
    hoverAnimationOutDuration: value.hover?.out ?? baseOut,
  };
}

export const Touchable = (props: TouchableProps) => {
  const {
    underlayColor = 'transparent',
    defaultUnderlayOpacity = 0,
    activeUnderlayOpacity = 0.105,
    defaultOpacity = 1,
    animationDuration,
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

  const resolvedDurations = resolveAnimationDuration(animationDuration);

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
        {...resolvedDurations}
        ref={ref ?? null}
        enabled={!disabled}
        defaultOpacity={defaultOpacity}
        defaultUnderlayOpacity={defaultUnderlayOpacity}
        activeUnderlayOpacity={activeUnderlayOpacity}
        underlayColor={underlayColor}>
        {children}
      </GestureHandlerButton>
    </NativeDetector>
  );
};
