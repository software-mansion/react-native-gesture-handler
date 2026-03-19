import * as React from 'react';
import { ColorValue, View, ViewProps } from 'react-native';

type ButtonProps = ViewProps & {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  enabled?: boolean;
  animationDuration?: number;
  activeOpacity?: number;
  activeScale?: number;
  activeUnderlayOpacity?: number;
  startOpacity?: number;
  startScale?: number;
  startUnderlayOpacity?: number;
  underlayColor?: ColorValue;
};

export const ButtonComponent = ({
  enabled = true,
  animationDuration = 100,
  activeOpacity = 1,
  activeScale = 1,
  activeUnderlayOpacity = 0,
  startOpacity = 1,
  startScale = 1,
  startUnderlayOpacity = 0,
  underlayColor,
  style,
  children,
  ...rest
}: ButtonProps) => {
  const [pressed, setPressed] = React.useState(false);

  const pressIn = React.useCallback(() => {
    if (enabled) {
      setPressed(true);
    }
  }, [enabled]);

  const pressOut = React.useCallback(() => {
    setPressed(false);
  }, []);

  const currentUnderlayOpacity = pressed
    ? activeUnderlayOpacity
    : startUnderlayOpacity;
  const hasUnderlay = underlayColor != null;
  const hasOpacity = activeOpacity !== 1 || startOpacity !== 1;
  const currentOpacity = pressed ? activeOpacity : startOpacity;
  const hasScale = activeScale !== 1 || startScale !== 1;
  const currentScale = pressed ? activeScale : startScale;

  const easing = 'cubic-bezier(0, 0, 0.2, 1)';
  const transitionProps: string[] = [];
  if (hasOpacity) {
    transitionProps.push(`opacity ${animationDuration}ms ${easing}`);
  }
  if (hasScale) {
    transitionProps.push(`transform ${animationDuration}ms ${easing}`);
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
            transition: `opacity ${animationDuration}ms ${easing}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </View>
  );
};

export default ButtonComponent;
