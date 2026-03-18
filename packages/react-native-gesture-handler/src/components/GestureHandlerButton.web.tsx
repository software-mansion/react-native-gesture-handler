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

  const currentOpacity = pressed ? activeOpacity : startOpacity;
  const currentScale = pressed ? activeScale : startScale;
  const currentUnderlayOpacity = pressed
    ? activeUnderlayOpacity
    : startUnderlayOpacity;
  const hasUnderlay = underlayColor != null;

  const easing = 'cubic-bezier(0, 0, 0.2, 1)';
  const transition = `opacity ${animationDuration}ms ${easing}, transform ${animationDuration}ms ${easing}`;

  return (
    <View
      accessibilityRole="button"
      style={[
        style,
        {
          opacity: currentOpacity,
          transform: [{ scale: currentScale }],
          // @ts-ignore - web-only CSS property
          transition,
          // Clip the underlay to the view bounds (respects borderRadius).
          ...(hasUnderlay && { overflow: 'hidden' }),
        },
      ]}
      // @ts-ignore - web-only pointer events
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
