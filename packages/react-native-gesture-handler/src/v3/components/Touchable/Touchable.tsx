import React, { use, useCallback, useRef } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { Platform } from 'react-native';

import GestureHandlerButton, {
  type ButtonEvent,
} from '../../../components/GestureHandlerButton';
import { getTVProps } from '../../../components/utils';
import { NativeDetector } from '../../detectors/NativeDetector';
import { useNativeGesture } from '../../hooks';
import {
  isKeyboardDismissingTap,
  JSResponderContext,
} from '../ScrollViewResponderInterceptor';
import type { AnimationDuration, TouchableProps } from './TouchableProps';

const isAndroid = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };
const DEFAULT_IN_DURATION_MS = 50;
const DEFAULT_OUT_DURATION_MS = 100;

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

  const jsResponderContext = use(JSResponderContext);
  const dropKeyboardTapRef = useRef<boolean | null>(null);

  const internalOnPress = useCallback(
    (e: NativeSyntheticEvent<ButtonEvent>) => {
      if (dropKeyboardTapRef.current) {
        return;
      }

      onPress?.(e.nativeEvent);
    },
    [onPress]
  );

  const internalOnPressIn = useCallback(
    (e: NativeSyntheticEvent<ButtonEvent>) => {
      // PressIn opens every press sequence; capture the verdict once per
      // sequence so a re-entry PressIn (with cancelOnLeave={false}) doesn't
      // overwrite it after the keyboard is already dismissed.
      dropKeyboardTapRef.current ??=
        isKeyboardDismissingTap(jsResponderContext);

      if (dropKeyboardTapRef.current) {
        return;
      }

      onPressIn?.(e.nativeEvent);
    },
    [jsResponderContext, onPressIn]
  );

  const internalOnPressOut = useCallback(
    (e: NativeSyntheticEvent<ButtonEvent>) => {
      if (dropKeyboardTapRef.current) {
        return;
      }

      onPressOut?.(e.nativeEvent);
    },
    [onPressOut]
  );

  const internalOnLongPress = useCallback(
    (e: NativeSyntheticEvent<ButtonEvent>) => {
      if (dropKeyboardTapRef.current) {
        return;
      }

      onLongPress?.(e.nativeEvent);
    },
    [onLongPress]
  );

  // InteractionFinished is dispatched after the terminal PressOut/Press
  // events, so resetting synchronously here is safe.
  const internalOnInteractionFinished = useCallback(() => {
    dropKeyboardTapRef.current = null;
  }, []);

  const nativeGesture = useNativeGesture({
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
        longPressDuration={resolvedDelayLongPress}
        hasLongPressHandler={onLongPress !== undefined}
        onPress={internalOnPress}
        onPressIn={internalOnPressIn}
        onPressOut={internalOnPressOut}
        onLongPress={internalOnLongPress}
        onInteractionFinished={internalOnInteractionFinished}>
        {children}
      </GestureHandlerButton>
    </NativeDetector>
  );
};
