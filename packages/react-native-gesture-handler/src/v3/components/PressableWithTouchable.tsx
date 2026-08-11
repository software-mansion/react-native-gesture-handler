import React, { useEffect, useRef, useState } from 'react';
import type { Insets } from 'react-native';

import type { ButtonEvent } from '../../components/GestureHandlerButton';
import type {
  InnerPressableEvent,
  PressableProps,
} from '../../components/Pressable/PressableProps';
import { addInsets, numberAsInset } from '../../components/Pressable/utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { Touchable } from './Touchable/Touchable';

// The native button reports coordinates on every press/hover event, so a
// `ButtonEvent` carries everything a `PressableEvent` exposes. There is no touch
// list at this layer, so `touches`/`changedTouches` mirror the single point
// (matching the other Pressable event converters).
function buttonToPressableEvent(event: ButtonEvent) {
  const timestamp = Date.now();
  const inner: InnerPressableEvent = {
    identifier: 0,
    locationX: event.x,
    locationY: event.y,
    pageX: event.absoluteX,
    pageY: event.absoluteY,
    target: 0,
    timestamp,
    touches: [],
    changedTouches: [],
    force: undefined,
  };

  return {
    nativeEvent: {
      ...inner,
      touches: [inner],
      changedTouches: [inner],
    },
  };
}

function normalizeInset(value: Insets | number | null | undefined): Insets {
  return typeof value === 'number'
    ? numberAsInset(value)
    : (value ?? numberAsInset(0));
}

type Timers = {
  press: ReturnType<typeof setTimeout> | null;
  hoverIn: ReturnType<typeof setTimeout> | null;
  hoverOut: ReturnType<typeof setTimeout> | null;
};

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

  // Pull the props that must not reach Touchable: `cancelable` /
  // `dimensionsAfterResize` are unsupported here, and the relation props are
  // handled by the wrapper (which routes them to the stateful implementation).
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

  const [pressed, setPressed] = useState(testOnly_pressed ?? false);
  const timers = useRef<Timers>({ press: null, hoverIn: null, hoverOut: null });

  // Clear any pending timers on unmount so a delayed callback never fires into
  // a torn-down component.
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

  const appliedHitSlop = addInsets(
    normalizeInset(hitSlop),
    normalizeInset(pressRetentionOffset)
  );

  const firePressIn = (event: ButtonEvent) => {
    setPressed(true);
    onPressIn?.(buttonToPressableEvent(event));
  };

  const handlePressIn = (event: ButtonEvent) => {
    if (unstable_pressDelay) {
      timers.current.press = setTimeout(() => {
        timers.current.press = null;
        firePressIn(event);
      }, unstable_pressDelay);
      return;
    }
    firePressIn(event);
  };

  const handlePressOut = (event: ButtonEvent) => {
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

  const handleHoverIn = onHoverIn
    ? (event: ButtonEvent) => {
        if (timers.current.hoverOut) {
          clearTimeout(timers.current.hoverOut);
          timers.current.hoverOut = null;
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

  const handleHoverOut = onHoverOut
    ? (event: ButtonEvent) => {
        if (timers.current.hoverIn) {
          clearTimeout(timers.current.hoverIn);
          timers.current.hoverIn = null;
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

  const resolvedStyle =
    typeof style === 'function' ? style({ pressed }) : style;

  const resolvedChildren =
    typeof children === 'function' ? children({ pressed }) : children;

  return (
    <Touchable
      {...remainingProps}
      ref={ref}
      accessible={accessible !== false}
      disabled={disabled === true}
      hitSlop={appliedHitSlop}
      onLayout={onLayout}
      androidRipple={androidRipple}
      touchSoundDisabled={android_disableSound ?? undefined}
      delayLongPress={delayLongPress ?? undefined}
      style={resolvedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={
        onPress ? (event) => onPress(buttonToPressableEvent(event)) : undefined
      }
      onLongPress={
        onLongPress
          ? (event) => onLongPress(buttonToPressableEvent(event))
          : undefined
      }
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}>
      {resolvedChildren}
      {__DEV__ ? (
        <PressabilityDebugView color="red" hitSlop={appliedHitSlop} />
      ) : null}
    </Touchable>
  );
};

export default PressableWithTouchable;
