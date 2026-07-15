import { NativeGestureRole } from '@swmansion/gesture-handler-dom-engine/src/interfaces';
import { GestureLifecycleEvent } from '@swmansion/gesture-handler-dom-engine/src/tools/GestureLifecycleEvents';
import * as React from 'react';

// DOM host button (adapted from react-native-gesture-handler's
// GestureHandlerButton.web.tsx: RN View replaced with a div, RN synthetic
// events with React DOM pointer events). Implements the cross-platform
// TouchableButtonProps contract with CSS transitions.

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

export type ButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
  enabled?: boolean;
  tapAnimationInDuration?: number;
  tapAnimationOutDuration?: number;
  longPressDuration?: number;
  longPressAnimationOutDuration?: number;
  hoverAnimationInDuration?: number;
  hoverAnimationOutDuration?: number;
  activeOpacity?: number;
  activeScale?: number;
  activeUnderlayOpacity?: number;
  hoverOpacity?: number;
  hoverScale?: number;
  hoverUnderlayOpacity?: number;
  defaultOpacity?: number;
  defaultScale?: number;
  defaultUnderlayOpacity?: number;
  underlayColor?: string;
};

export const ButtonComponent = ({
  ref: externalRef,
  enabled = true,
  tapAnimationInDuration = 50,
  tapAnimationOutDuration = 100,
  longPressDuration = -1,
  longPressAnimationOutDuration = 100,
  hoverAnimationInDuration = 50,
  hoverAnimationOutDuration = 100,
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
  const hoverOpacity = hoverOpacityProp ?? defaultOpacity;
  const hoverScale = hoverScaleProp ?? defaultScale;
  const hoverUnderlayOpacity =
    hoverUnderlayOpacityProp ?? defaultUnderlayOpacity;

  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [currentDuration, setCurrentDuration] = React.useState(
    tapAnimationInDuration
  );
  const pressInTimestamp = React.useRef(0);
  const pressOutTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const gestureEnabledRef = React.useRef(true);
  const viewRef = React.useRef<HTMLDivElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewRef.current = node;
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
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || !gestureEnabledRef.current) {
        return;
      }

      event.stopPropagation();
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      pressInTimestamp.current = performance.now();
      setCurrentDuration(tapAnimationInDuration);
      setPressed(true);
    },
    [enabled, tapAnimationInDuration]
  );

  const pressOut = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
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

      if (longPressDuration >= 0 && elapsed >= longPressDuration) {
        // Long-press release — use the configured long-press out duration.
        setCurrentDuration(longPressAnimationOutDuration);
        setPressed(false);
      } else if (elapsed >= tapAnimationInDuration) {
        // Press-in animation fully finished - release with the configured out duration.
        setCurrentDuration(tapAnimationOutDuration);
        setPressed(false);
        // elapsed * 2 to ensure there is at least half of the tapAnimationOutDuration left for the animation to play
      } else if (elapsed * 2 >= tapAnimationOutDuration) {
        setCurrentDuration(elapsed);
        setPressed(false);
      } else {
        // Let the in-progress CSS press-in transition continue; schedule press-out after remaining time.
        const remaining = tapAnimationInDuration - elapsed;
        pressOutTimer.current = setTimeout(
          () => {
            pressOutTimer.current = null;
            setCurrentDuration(tapAnimationOutDuration);
            setPressed(false);
          },
          prefersReducedMotion() ? 0 : remaining
        );
      }
    },
    [
      longPressDuration,
      longPressAnimationOutDuration,
      tapAnimationInDuration,
      tapAnimationOutDuration,
    ]
  );

  const handlePointerEnter = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || event.pointerType === 'touch') {
        return;
      }
      // Skip duration update while pressed so the press transition owns it.
      if (!pressed) {
        setCurrentDuration(hoverAnimationInDuration);
      }
      setHovered(true);
    },
    [enabled, pressed, hoverAnimationInDuration]
  );

  const handlePointerLeave = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      pressOut(event);
      if (event.pointerType === 'touch') {
        return;
      }
      if (!pressed) {
        setCurrentDuration(hoverAnimationOutDuration);
      }
      setHovered(false);
    },
    [pressOut, pressed, hoverAnimationOutDuration]
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
  const hasUnderlay = underlayColor != null && underlayColor !== 'transparent';
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
  const effectiveDuration = prefersReducedMotion() ? 0 : currentDuration;
  const transitionProps: string[] = [];
  if (hasOpacity) {
    transitionProps.push(`opacity ${effectiveDuration}ms ${easing}`);
  }
  if (hasScale) {
    transitionProps.push(`transform ${effectiveDuration}ms ${easing}`);
  }
  const transition = transitionProps.join(', ');

  return (
    <div
      {...rest}
      ref={setRef}
      role="button"
      style={{
        position: 'relative',
        ...style,
        ...(hasOpacity && { opacity: currentOpacity }),
        ...(hasScale && { transform: `scale(${currentScale})` }),
        transition,
        // Clip the underlay to the element bounds (respects borderRadius).
        ...(hasUnderlay && { overflow: 'hidden' }),
      }}
      onPointerEnter={handlePointerEnter}
      onPointerDown={pressIn}
      onPointerUp={pressOut}
      onPointerCancel={pressOut}
      onPointerLeave={handlePointerLeave}>
      {hasUnderlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: underlayColor,
            opacity: currentUnderlayOpacity,
            transition: `opacity ${effectiveDuration}ms ${easing}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
};

ButtonComponent.displayName = NativeGestureRole.Button;

export default ButtonComponent;
