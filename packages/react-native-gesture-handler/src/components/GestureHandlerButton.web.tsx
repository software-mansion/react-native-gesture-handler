import * as React from 'react';
import type { ColorValue, NativeSyntheticEvent, ViewProps } from 'react-native';
import { View } from 'react-native';

import type { ButtonEvent } from '../specs/RNGestureHandlerButtonNativeComponent';
import { NativeGestureRole } from '../web/interfaces';
import { ButtonEventName } from '../web/tools/ButtonEvents';
import { GestureLifecycleEvent } from '../web/tools/GestureLifecycleEvents';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

type ButtonProps = ViewProps & {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
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
  underlayColor?: ColorValue;
  onButtonPress?:
    | ((event: NativeSyntheticEvent<ButtonEvent>) => void)
    | undefined;
  onButtonPressIn?:
    | ((event: NativeSyntheticEvent<ButtonEvent>) => void)
    | undefined;
  onButtonPressOut?:
    | ((event: NativeSyntheticEvent<ButtonEvent>) => void)
    | undefined;
  onButtonLongPress?:
    | ((event: NativeSyntheticEvent<ButtonEvent>) => void)
    | undefined;
  onButtonInteractionFinished?:
    | ((event: NativeSyntheticEvent<ButtonEvent>) => void)
    | undefined;
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
  onButtonPress,
  onButtonPressIn,
  onButtonPressOut,
  onButtonLongPress,
  onButtonInteractionFinished,
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

  const pressIn = React.useCallback(() => {
    if (!enabled || !gestureEnabledRef.current) {
      return;
    }

    if (pressOutTimer.current != null) {
      clearTimeout(pressOutTimer.current);
      pressOutTimer.current = null;
    }
    pressInTimestamp.current = performance.now();
    setCurrentDuration(tapAnimationInDuration);
    setPressed(true);
  }, [enabled, tapAnimationInDuration]);

  const pressOut = React.useCallback(() => {
    // Only release if a press-in was actually recorded — guards against
    // stray pointer events and lets us complete the release cycle even if
    // `enabled` flipped to false between press-in and press-out.
    if (pressInTimestamp.current === 0 || !gestureEnabledRef.current) {
      return;
    }

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
  }, [
    longPressDuration,
    longPressAnimationOutDuration,
    tapAnimationInDuration,
    tapAnimationOutDuration,
  ]);

  React.useEffect(() => {
    const node = viewRef.current;
    const wrapEvent = (event: Event): NativeSyntheticEvent<ButtonEvent> =>
      ({
        nativeEvent: (event as CustomEvent<ButtonEvent>).detail,
      }) as NativeSyntheticEvent<ButtonEvent>;

    const handlePress = (event: Event) => {
      onButtonPress?.(wrapEvent(event));
    };
    const handlePressIn = (event: Event) => {
      pressIn();
      onButtonPressIn?.(wrapEvent(event));
    };
    const handlePressOut = (event: Event) => {
      pressOut();
      onButtonPressOut?.(wrapEvent(event));
    };
    const handleLongPress = (event: Event) => {
      onButtonLongPress?.(wrapEvent(event));
    };
    const handleInteractionFinished = (event: Event) => {
      onButtonInteractionFinished?.(wrapEvent(event));
    };

    node?.addEventListener(ButtonEventName.Press, handlePress);
    node?.addEventListener(ButtonEventName.PressIn, handlePressIn);
    node?.addEventListener(ButtonEventName.PressOut, handlePressOut);
    node?.addEventListener(ButtonEventName.LongPress, handleLongPress);
    node?.addEventListener(
      ButtonEventName.InteractionFinished,
      handleInteractionFinished
    );

    return () => {
      node?.removeEventListener(ButtonEventName.Press, handlePress);
      node?.removeEventListener(ButtonEventName.PressIn, handlePressIn);
      node?.removeEventListener(ButtonEventName.PressOut, handlePressOut);
      node?.removeEventListener(ButtonEventName.LongPress, handleLongPress);
      node?.removeEventListener(
        ButtonEventName.InteractionFinished,
        handleInteractionFinished
      );
    };
  }, [
    onButtonInteractionFinished,
    onButtonLongPress,
    onButtonPress,
    onButtonPressIn,
    onButtonPressOut,
    pressIn,
    pressOut,
  ]);

  const handlePointerEnter = React.useCallback(
    (event: NativeSyntheticEvent<{ pointerType?: string }>) => {
      if (!enabled || event.nativeEvent.pointerType === 'touch') {
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
    (event: NativeSyntheticEvent<{ pointerType?: string }>) => {
      if (event.nativeEvent.pointerType === 'touch') {
        return;
      }
      if (!pressed) {
        setCurrentDuration(hoverAnimationOutDuration);
      }
      setHovered(false);
    },
    [pressed, hoverAnimationOutDuration]
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
            transition: `opacity ${effectiveDuration}ms ${easing}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </View>
  );
};

ButtonComponent.displayName = NativeGestureRole.Button;

export default ButtonComponent;
