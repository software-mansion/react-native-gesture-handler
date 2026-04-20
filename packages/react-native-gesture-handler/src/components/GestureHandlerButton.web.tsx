import * as React from 'react';
import type { ColorValue, ViewProps } from 'react-native';
import { View } from 'react-native';

type ButtonProps = ViewProps & {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  enabled?: boolean;
  pressAndHoldAnimationDuration?: number;
  tapAnimationDuration?: number;
  activeOpacity?: number;
  activeScale?: number;
  activeUnderlayOpacity?: number;
  defaultOpacity?: number;
  defaultScale?: number;
  defaultUnderlayOpacity?: number;
  underlayColor?: ColorValue;
};

export const ButtonComponent = ({
  enabled = true,
  pressAndHoldAnimationDuration: pressAndHoldAnimationDurationProp = -1,
  tapAnimationDuration: tapAnimationDurationProp = 100,
  activeOpacity = 1,
  activeScale = 1,
  activeUnderlayOpacity = 0,
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

  const [pressed, setPressed] = React.useState(false);
  const [currentDuration, setCurrentDuration] = React.useState(
    pressAndHoldAnimationDuration
  );
  const pressInTimestamp = React.useRef(0);
  const pressOutTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    return () => {
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
      }
    };
  }, []);

  const pressIn = React.useCallback(() => {
    if (enabled) {
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      pressInTimestamp.current = performance.now();
      setCurrentDuration(pressAndHoldAnimationDuration);
      setPressed(true);
    }
  }, [enabled, pressAndHoldAnimationDuration]);

  const pressOut = React.useCallback(() => {
    if (pressOutTimer.current != null) {
      clearTimeout(pressOutTimer.current);
      pressOutTimer.current = null;
    }
    const elapsed = performance.now() - pressInTimestamp.current;

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
  }, [pressAndHoldAnimationDuration, tapAnimationDuration]);

  const currentUnderlayOpacity = pressed
    ? activeUnderlayOpacity
    : defaultUnderlayOpacity;
  const hasUnderlay = underlayColor != null;
  const hasOpacity = activeOpacity !== 1 || defaultOpacity !== 1;
  const currentOpacity = pressed ? activeOpacity : defaultOpacity;
  const hasScale = activeScale !== 1 || defaultScale !== 1;
  const currentScale = pressed ? activeScale : defaultScale;

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
      onPointerDown={pressIn}
      onPointerUp={pressOut}
      onPointerCancel={pressOut}
      onPointerLeave={pressOut}
      {...rest}>
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
