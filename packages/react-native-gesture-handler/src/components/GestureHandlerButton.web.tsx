import * as React from 'react';
import { ColorValue, View, ViewProps } from 'react-native';

type ButtonProps = ViewProps & {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  enabled?: boolean;
  animationDuration?: number;
  minimumAnimationDuration?: number;
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
  animationDuration: animationDurationProp = -1,
  minimumAnimationDuration = 100,
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
  const animationDuration =
    animationDurationProp < 0
      ? minimumAnimationDuration
      : animationDurationProp;

  const [pressed, setPressed] = React.useState(false);
  const [currentDuration, setCurrentDuration] =
    React.useState(animationDuration);
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
      pressInTimestamp.current = Date.now();
      setCurrentDuration(animationDuration);
      setPressed(true);
    }
  }, [enabled, animationDuration]);

  const pressOut = React.useCallback(() => {
    const elapsed = Date.now() - pressInTimestamp.current;

    if (elapsed >= animationDuration) {
      setCurrentDuration(animationDuration);
      setPressed(false);
      // elapsed * 2 to ensure there is at least half of the minDuration left for the animation to play
    } else if (elapsed * 2 >= minimumAnimationDuration) {
      setCurrentDuration(elapsed);
      setPressed(false);
    } else {
      // Let the in-progress CSS press-in transition continue; schedule press-out after remaining time
      const remaining = minimumAnimationDuration - elapsed;
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
      }
      pressOutTimer.current = setTimeout(() => {
        pressOutTimer.current = null;
        setCurrentDuration(minimumAnimationDuration);
        setPressed(false);
      }, remaining);
    }
  }, [animationDuration, minimumAnimationDuration]);

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
