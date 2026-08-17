import React, { useEffect, useRef, useState } from 'react';
import type { Insets, LayoutChangeEvent } from 'react-native';

import type { ButtonEvent } from '../../components/GestureHandlerButton';
import type {
  InnerPressableEvent,
  PressableDimensions,
  PressableProps,
} from '../../components/Pressable/PressableProps';
import {
  addInsets,
  isTouchWithinInset,
  numberAsInset,
} from '../../components/Pressable/utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { isTestEnv } from '../../utils';
import { pointerStyle } from './pointerStyle';
import { Touchable } from './Touchable/Touchable';

const IS_TEST_ENV = isTestEnv();

// RN's Pressable default. Touchable's own default is 600ms
const DEFAULT_LONG_PRESS_DURATION = 500;

type Timers = {
  press: ReturnType<typeof setTimeout> | null;
  hoverIn: ReturnType<typeof setTimeout> | null;
  hoverOut: ReturnType<typeof setTimeout> | null;
};

function normalizeInset(value: Insets | number | null | undefined): Insets {
  return typeof value === 'number'
    ? numberAsInset(value)
    : (value ?? numberAsInset(0));
}

function buttonToInner(event: ButtonEvent): InnerPressableEvent {
  return {
    identifier: 0,
    locationX: event.x,
    locationY: event.y,
    pageX: event.absoluteX,
    pageY: event.absoluteY,
    target: 0,
    timestamp: Date.now(),
    touches: [],
    changedTouches: [],
    force: undefined,
  };
}

function buttonToPressableEvent(event: ButtonEvent) {
  const inner = buttonToInner(event);

  return {
    nativeEvent: {
      ...inner,
      touches: [inner],
      changedTouches: [inner],
    },
  };
}

const PressableWithTouchable = (props: PressableProps) => {
  const {
    testOnly_pressed,
    hitSlop,
    pressRetentionOffset,
    delayHoverIn,
    delayHoverOut,
    delayLongPress,
    unstable_pressDelay,
    onHoverIn,
    onHoverOut,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    onLayout,
    style,
    children,
    android_disableSound,
    android_ripple,
    disabled,
    accessible,
    ref,
    ...rest
  } = props;

  // Drop props Touchable doesn't take: `cancelable`/`dimensionsAfterResize` are
  // unsupported; the relation props are handled by the wrapper.
  //
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    cancelable,
    dimensionsAfterResize,
    simultaneousWith,
    requireToFail,
    block,
    ...remainingProps
  } = rest;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const [pressed, setPressed] = useState(false);
  const timers = useRef<Timers>({ press: null, hoverIn: null, hoverOut: null });
  const dimensions = useRef<PressableDimensions>({ width: 0, height: 0 });

  // Whether the in-progress press activated within hitSlop (see handlePressIn).
  const isActive = useRef(false);

  useEffect(
    () => () => {
      const pending = timers.current;

      if (pending.press) {
        clearTimeout(pending.press);
      }

      if (pending.hoverIn) {
        clearTimeout(pending.hoverIn);
      }

      if (pending.hoverOut) {
        clearTimeout(pending.hoverOut);
      }
    },
    []
  );

  // RN's ripple config allows `null` on every field; Touchable's excludes it.
  // Normalize `null` → `undefined` so the types line up.
  const androidRipple = android_ripple
    ? {
        color: android_ripple.color ?? undefined,
        borderless: android_ripple.borderless ?? undefined,
        radius: android_ripple.radius ?? undefined,
        foreground: android_ripple.foreground ?? undefined,
      }
    : undefined;

  // Activation is gated to `normalizedHitSlop` (see handlePressIn); the native
  // button gets the wider `appliedHitSlop` so an active press is retained out
  // to hitSlop + pressRetentionOffset before it cancels.
  const normalizedHitSlop = normalizeInset(hitSlop);
  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizeInset(pressRetentionOffset)
  );

  // Long press is measured from onPressIn, which `unstable_pressDelay` defers,
  // so fold it in to match RN / StatefulPressable.
  const resolvedDelayLongPress =
    (delayLongPress ?? DEFAULT_LONG_PRESS_DURATION) +
    (unstable_pressDelay ?? 0);

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    dimensions.current = event.nativeEvent.layout;
  };

  const firePressIn = (event: ButtonEvent) => {
    setPressed(true);
    onPressIn?.(buttonToPressableEvent(event));
  };

  const handlePressIn = (event: ButtonEvent) => {
    // A down in the retention-only zone is held by the button but isn't a press.
    isActive.current = isTouchWithinInset(
      dimensions.current,
      normalizedHitSlop,
      buttonToInner(event)
    );

    if (!isActive.current) {
      return;
    }

    if (unstable_pressDelay) {
      // Drop a still-pending timer so a re-entrant press can't double-fire.
      if (timers.current.press) {
        clearTimeout(timers.current.press);
      }

      timers.current.press = setTimeout(() => {
        timers.current.press = null;
        firePressIn(event);
      }, unstable_pressDelay);
      return;
    }

    firePressIn(event);
  };

  const handlePressOut = (event: ButtonEvent) => {
    // Not cleared here: onPress fires after onPressOut and must stay suppressed
    // too; isActive resets on the next press-in.
    if (!isActive.current) {
      return;
    }

    // If the touch is released before `unstable_pressDelay` elapses, RN still
    // emits the deferred `onPressIn` before `onPressOut` — flush it now.
    if (timers.current.press) {
      clearTimeout(timers.current.press);
      timers.current.press = null;
      firePressIn(event);
    }

    setPressed(false);
    onPressOut?.(buttonToPressableEvent(event));
  };

  const handlePress = onPress
    ? (event: ButtonEvent) => {
        if (isActive.current) {
          onPress(buttonToPressableEvent(event));
        }
      }
    : undefined;

  const handleLongPress = onLongPress
    ? (event: ButtonEvent) => {
        if (!isActive.current) {
          return;
        }
        // Flush the deferred onPressIn so it can't arrive after onLongPress
        // (e.g. delayLongPress={0} makes the two timers coincide).
        if (timers.current.press) {
          clearTimeout(timers.current.press);
          timers.current.press = null;
          firePressIn(event);
        }
        onLongPress(buttonToPressableEvent(event));
      }
    : undefined;

  // Wire each handler whenever the opposite side can leave a pending timer, so a
  // delayed hover callback is cancelled once the pointer leaves/re-enters.
  const needsHoverIn =
    onHoverIn != null || (onHoverOut != null && !!delayHoverOut);
  const needsHoverOut =
    onHoverOut != null || (onHoverIn != null && !!delayHoverIn);

  const handleHoverIn = needsHoverIn
    ? (event: ButtonEvent) => {
        if (timers.current.hoverOut) {
          clearTimeout(timers.current.hoverOut);
          timers.current.hoverOut = null;
        }

        if (!onHoverIn) {
          return;
        }

        if (delayHoverIn) {
          timers.current.hoverIn = setTimeout(() => {
            timers.current.hoverIn = null;
            onHoverIn(buttonToPressableEvent(event));
          }, delayHoverIn);
          return;
        }

        onHoverIn(buttonToPressableEvent(event));
      }
    : undefined;

  const handleHoverOut = needsHoverOut
    ? (event: ButtonEvent) => {
        if (timers.current.hoverIn) {
          clearTimeout(timers.current.hoverIn);
          timers.current.hoverIn = null;
        }

        if (!onHoverOut) {
          return;
        }

        if (delayHoverOut) {
          timers.current.hoverOut = setTimeout(() => {
            timers.current.hoverOut = null;
            onHoverOut(buttonToPressableEvent(event));
          }, delayHoverOut);
          return;
        }

        onHoverOut(buttonToPressableEvent(event));
      }
    : undefined;

  // `testOnly_pressed` forces the pressed state for snapshots/tests. Derive the
  // displayed value from it each render, keeping the interactive `pressed` state
  // independent (seeded to false) so clearing the prop doesn't leave it stuck.
  const displayPressed = testOnly_pressed ?? pressed;

  const resolvedStyle =
    typeof style === 'function' ? style({ pressed: displayPressed }) : style;

  const resolvedChildren =
    typeof children === 'function'
      ? children({ pressed: displayPressed })
      : children;

  return (
    <Touchable
      {...remainingProps}
      ref={ref}
      accessible={accessible !== false}
      disabled={disabled === true}
      hitSlop={appliedHitSlop}
      onLayout={handleLayout}
      androidRipple={androidRipple}
      touchSoundDisabled={android_disableSound ?? undefined}
      delayLongPress={resolvedDelayLongPress}
      style={[pointerStyle, resolvedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      testOnly_onPress={IS_TEST_ENV ? onPress : undefined}
      testOnly_onPressIn={IS_TEST_ENV ? onPressIn : undefined}
      testOnly_onPressOut={IS_TEST_ENV ? onPressOut : undefined}
      testOnly_onLongPress={IS_TEST_ENV ? onLongPress : undefined}
      testOnly_onHoverIn={IS_TEST_ENV ? onHoverIn : undefined}
      testOnly_onHoverOut={IS_TEST_ENV ? onHoverOut : undefined}>
      {resolvedChildren}
      {__DEV__ ? (
        <PressabilityDebugView color="red" hitSlop={normalizedHitSlop} />
      ) : null}
    </Touchable>
  );
};

export default PressableWithTouchable;
