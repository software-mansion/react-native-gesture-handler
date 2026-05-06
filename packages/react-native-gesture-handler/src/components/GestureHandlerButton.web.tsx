import * as React from 'react';
import type { ColorValue, NativeSyntheticEvent, ViewProps } from 'react-native';
import { View } from 'react-native';

import { GestureLifecycleEvent } from '../web/tools/GestureLifecycleEvents';

type ButtonProps = ViewProps & {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  enabled?: boolean;
  pressAndHoldAnimationDuration?: number;
  tapAnimationDuration?: number;
  hoverAnimationDuration?: number;
  activeOpacity?: number;
  activeScale?: number;
  activeUnderlayOpacity?: number;
  hoverOpacity?: number;
  hoverScale?: number;
  hoverUnderlayOpacity?: number;
  defaultOpacity?: number;
  defaultScale?: number;
  defaultUnderlayOpacity?: number;
  underlayColor?: ColorValue;
};

export const ButtonComponent = ({
  ref: externalRef,
  enabled = true,
  pressAndHoldAnimationDuration: pressAndHoldAnimationDurationProp = -1,
  tapAnimationDuration: tapAnimationDurationProp = 100,
  hoverAnimationDuration: hoverAnimationDurationProp = -1,
  activeOpacity = 1,
  activeScale = 1,
  activeUnderlayOpacity = 0,
  hoverOpacity: hoverOpacityProp,
  hoverScale: hoverScaleProp,
  hoverUnderlayOpacity: hoverUnderlayOpacityProp,
  defaultOpacity = 1,
  defaultScale = 1,
  defaultUnderlayOpacity = 0,
  underlayColor,
  style,
  children,
  ...rest
}: ButtonProps) => {
  const tapAnimationDuration =
    tapAnimationDurationProp < 0 ? 0 : tapAnimationDurationProp;
  const pressAndHoldAnimationDuration =
    pressAndHoldAnimationDurationProp < 0
      ? tapAnimationDuration
      : pressAndHoldAnimationDurationProp;
  const hoverAnimationDuration =
    hoverAnimationDurationProp < 0
      ? tapAnimationDuration
      : hoverAnimationDurationProp;

  const hoverOpacity = hoverOpacityProp ?? defaultOpacity;
  const hoverScale = hoverScaleProp ?? defaultScale;
  const hoverUnderlayOpacity =
    hoverUnderlayOpacityProp ?? defaultUnderlayOpacity;

  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [currentDuration, setCurrentDuration] = React.useState(
    pressAndHoldAnimationDuration
  );
  const pressInTimestamp = React.useRef(0);
  const pressOutTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const gestureEnabledRef = React.useRef(true);
  const viewRef = React.useRef<HTMLElement | null>(null);

  const setRef = React.useCallback(
    (node: React.ComponentRef<typeof View> | null) => {
      viewRef.current = node as unknown as HTMLElement | null;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef != null) {
        externalRef.current = node;
      }
    },
    [externalRef]
  );

  React.useEffect(() => {
    const node = viewRef.current;

    const handleGestureBegan = () => {
      gestureEnabledRef.current = true;
    };
    const handleGestureCanceled = () => {
      gestureEnabledRef.current = false;
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      pressInTimestamp.current = 0;
      setPressed(false);
    };

    node?.addEventListener(GestureLifecycleEvent.Began, handleGestureBegan);
    node?.addEventListener(
      GestureLifecycleEvent.Canceled,
      handleGestureCanceled
    );

    return () => {
      node?.removeEventListener(
        GestureLifecycleEvent.Began,
        handleGestureBegan
      );
      node?.removeEventListener(
        GestureLifecycleEvent.Canceled,
        handleGestureCanceled
      );
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
      }
    };
  }, []);

  const pressIn = React.useCallback(
    (event: NativeSyntheticEvent<unknown>) => {
      if (!enabled || !gestureEnabledRef.current) {
        return;
      }

      event.stopPropagation();
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      pressInTimestamp.current = performance.now();
      setCurrentDuration(pressAndHoldAnimationDuration);
      setPressed(true);
    },
    [enabled, pressAndHoldAnimationDuration]
  );

  const pressOut = React.useCallback(
    (event: NativeSyntheticEvent<unknown>) => {
      // Only release if a press-in was actually recorded — guards against
      // stray pointer events and lets us complete the release cycle even if
      // `enabled` flipped to false between press-in and press-out.
      if (pressInTimestamp.current === 0 || !gestureEnabledRef.current) {
        return;
      }

      event.stopPropagation();
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      const elapsed = performance.now() - pressInTimestamp.current;
      pressInTimestamp.current = 0;

      if (elapsed >= pressAndHoldAnimationDuration) {
        setCurrentDuration(pressAndHoldAnimationDuration);
        setPressed(false);
        // elapsed * 2 to ensure there is at least half of the tapAnimationDuration left for the animation to play
      } else if (elapsed * 2 >= tapAnimationDuration) {
        setCurrentDuration(elapsed);
        setPressed(false);
      } else {
        // Let the in-progress CSS press-in transition continue; schedule press-out after remaining time
        const remaining = tapAnimationDuration - elapsed;
        pressOutTimer.current = setTimeout(() => {
          pressOutTimer.current = null;
          setCurrentDuration(tapAnimationDuration);
          setPressed(false);
        }, remaining);
      }
    },
    [pressAndHoldAnimationDuration, tapAnimationDuration]
  );

  const handlePointerEnter = React.useCallback(
    (event: NativeSyntheticEvent<{ pointerType?: string }>) => {
      if (!enabled || event.nativeEvent.pointerType === 'touch') {
        return;
      }
      // Skip duration update while pressed so the press transition owns it.
      if (!pressed) {
        setCurrentDuration(hoverAnimationDuration);
      }
      setHovered(true);
    },
    [enabled, pressed, hoverAnimationDuration]
  );

  const handlePointerLeave = React.useCallback(
    (event: NativeSyntheticEvent<{ pointerType?: string }>) => {
      pressOut(event);
      if (event.nativeEvent.pointerType === 'touch') {
        return;
      }
      if (!pressed) {
        setCurrentDuration(hoverAnimationDuration);
      }
      setHovered(false);
    },
    [pressOut, pressed, hoverAnimationDuration]
  );

  // Mask hover at render rather than clearing the state. Avoids a state
  // write inside an effect, and lets hover resume naturally when `enabled`
  // flips back to true while the pointer is still inside.
  const effectiveHovered = hovered && enabled;

  const currentUnderlayOpacity = pressed
    ? activeUnderlayOpacity
    : effectiveHovered
      ? hoverUnderlayOpacity
      : defaultUnderlayOpacity;
  const hasUnderlay = underlayColor != null;
  const hasOpacity =
    activeOpacity !== 1 || hoverOpacity !== 1 || defaultOpacity !== 1;
  const currentOpacity = pressed
    ? activeOpacity
    : effectiveHovered
      ? hoverOpacity
      : defaultOpacity;
  const hasScale = activeScale !== 1 || hoverScale !== 1 || defaultScale !== 1;
  const currentScale = pressed
    ? activeScale
    : effectiveHovered
      ? hoverScale
      : defaultScale;

  const easing = 'cubic-bezier(0.5, 1, 0.89, 1)';
  const transitionProps: string[] = [];
  if (hasOpacity) {
    transitionProps.push(`opacity ${currentDuration}ms ${easing}`);
  }
  if (hasScale) {
    transitionProps.push(`transform ${currentDuration}ms ${easing}`);
  }
  const transition = transitionProps.join(', ');

  return (
    <View
      {...rest}
      ref={setRef}
      accessibilityRole="button"
      style={[
        style,
        {
          ...(hasOpacity && { opacity: currentOpacity }),
          ...(hasScale && { transform: [{ scale: currentScale }] }),
          // @ts-ignore - web-only CSS property
          transition,
          // Clip the underlay to the view bounds (respects borderRadius).
          ...(hasUnderlay && { overflow: 'hidden' }),
        },
      ]}
      onPointerEnter={handlePointerEnter}
      onPointerDown={pressIn}
      onPointerUp={pressOut}
      onPointerCancel={pressOut}
      onPointerLeave={handlePointerLeave}>
      {hasUnderlay && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: underlayColor as string,
            opacity: currentUnderlayOpacity,
            // @ts-ignore - web-only CSS properties
            transition: `opacity ${currentDuration}ms ${easing}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </View>
  );
};

export default ButtonComponent;
