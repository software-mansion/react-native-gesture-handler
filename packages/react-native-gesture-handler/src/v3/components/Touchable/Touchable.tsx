import React, { use, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

import GestureHandlerButton from '../../../components/GestureHandlerButton';
import { getTVProps } from '../../../components/utils';
import { NativeDetector } from '../../detectors/NativeDetector';
import { useNativeGesture } from '../../hooks';
import {
  isKeyboardDismissingTap,
  JSResponderContext,
} from '../ScrollViewResponderInterceptor';
import type {
  AnimationDuration,
  CallbackEventType,
  EndCallbackEventType,
  TouchableProps,
} from './TouchableProps';

const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };
const DEFAULT_IN_DURATION_MS = 50;
const DEFAULT_OUT_DURATION_MS = 100;

enum PointerState {
  UNKNOWN,
  INSIDE,
  OUTSIDE,
}

// Clamp user-supplied durations to finite, non-negative milliseconds.
// Negative, NaN, or Infinity values would produce invalid CSS transitions
// on web and negative setTimeout delays in branch 3 of the press-out path.
function sanitizeDuration(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function resolveAnimationDuration(value: AnimationDuration | undefined) {
  if (value === undefined) {
    return {
      tapAnimationInDuration: DEFAULT_IN_DURATION_MS,
      tapAnimationOutDuration: DEFAULT_OUT_DURATION_MS,
      longPressAnimationOutDuration: DEFAULT_OUT_DURATION_MS,
      hoverAnimationInDuration: DEFAULT_IN_DURATION_MS,
      hoverAnimationOutDuration: DEFAULT_OUT_DURATION_MS,
    };
  }

  if (typeof value === 'number') {
    const sanitized = sanitizeDuration(value);
    return {
      tapAnimationInDuration: sanitized,
      tapAnimationOutDuration: sanitized,
      longPressAnimationOutDuration: sanitized,
      hoverAnimationInDuration: sanitized,
      hoverAnimationOutDuration: sanitized,
    };
  }

  // The union guarantees variant 2 supplies top-level `in`/`out`, variant 3
  // supplies both category objects — so per-category fallback to base is
  // always defined for well-typed input; the 0 fallbacks here are unreachable.
  const baseIn = 'in' in value ? value.in : 0;
  const baseOut = 'out' in value ? value.out : 0;
  const tapOut = value.tap?.out ?? baseOut;

  return {
    tapAnimationInDuration: sanitizeDuration(value.tap?.in ?? baseIn),
    tapAnimationOutDuration: sanitizeDuration(tapOut),
    longPressAnimationOutDuration: sanitizeDuration(
      value.longPress?.out ?? tapOut
    ),
    hoverAnimationInDuration: sanitizeDuration(value.hover?.in ?? baseIn),
    hoverAnimationOutDuration: sanitizeDuration(value.hover?.out ?? baseOut),
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
  const resolvedDelayLongPress = sanitizeDuration(delayLongPress);

  const shouldUseNativeRipple = isAndroid && androidRipple !== undefined;

  const pointerState = useRef<PointerState>(PointerState.UNKNOWN);
  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Swallow the tap that dismisses the keyboard in
  // keyboardShouldPersistTaps="never", matching RN's touchables.
  const jsResponderContext = use(JSResponderContext);
  const dropKeyboardTapRef = useRef<boolean | null>(null);

  const captureKeyboardDismiss = useCallback(() => {
    dropKeyboardTapRef.current ??= isKeyboardDismissingTap(jsResponderContext);
  }, [jsResponderContext]);

  const resetKeyboardDismiss = useCallback(() => {
    dropKeyboardTapRef.current = null;
  }, []);

  const wrappedLongPress = useCallback(() => {
    longPressDetected.current = true;
    // @ts-ignore - the detector-based implementation is missing the event argument
    onLongPress?.();
  }, [onLongPress]);

  const startLongPressTimer = useCallback(() => {
    longPressDetected.current = false;

    if (onLongPress && !longPressTimeout.current) {
      longPressTimeout.current = setTimeout(
        wrappedLongPress,
        resolvedDelayLongPress
      );
    }
  }, [onLongPress, resolvedDelayLongPress, wrappedLongPress]);

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      captureKeyboardDismiss();

      if (!e.pointerInside || dropKeyboardTapRef.current) {
        pointerState.current = PointerState.OUTSIDE;
        return;
      }

      onPressIn?.(e);
      startLongPressTimer();

      pointerState.current = PointerState.INSIDE;
    },
    [captureKeyboardDismiss, startLongPressTimer, onPressIn]
  );

  const onActivate = useCallback((e: CallbackEventType) => {
    if (!e.pointerInside && longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const onFinalize = useCallback(
    (e: EndCallbackEventType) => {
      if (
        !dropKeyboardTapRef.current &&
        pointerState.current === PointerState.INSIDE
      ) {
        onPressOut?.(e);
      }

      if (
        !dropKeyboardTapRef.current &&
        !e.canceled &&
        !longPressDetected.current &&
        e.pointerInside
      ) {
        onPress?.(e);
      }

      pointerState.current = PointerState.UNKNOWN;

      if (longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }

      resetKeyboardDismiss();
    },
    [resetKeyboardDismiss, onPressOut, onPress]
  );

  const onUpdate = useCallback(
    (e: CallbackEventType) => {
      if (dropKeyboardTapRef.current) {
        return;
      }

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

  const tvProps = getTVProps(rest);

  return (
    <NativeDetector gesture={nativeGesture}>
      <GestureHandlerButton
        {...rest}
        {...tvProps}
        {...rippleProps}
        {...resolvedDurations}
        ref={ref ?? null}
        enabled={!disabled}
        defaultOpacity={defaultOpacity}
        defaultUnderlayOpacity={defaultUnderlayOpacity}
        activeUnderlayOpacity={activeUnderlayOpacity}
        underlayColor={underlayColor}
        longPressDuration={resolvedDelayLongPress}>
        {children}
      </GestureHandlerButton>
    </NativeDetector>
  );
};
