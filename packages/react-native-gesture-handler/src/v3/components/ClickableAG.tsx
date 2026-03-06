import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { RawButton } from './GestureButtons';
import type { BaseButtonProps } from './GestureButtonsProps';
import type { GestureEvent } from '../types';
import type { NativeHandlerData } from '../hooks/gestures/native/NativeTypes';

type CallbackEventType = GestureEvent<NativeHandlerData>;

export enum ClickableBehavior {
  NONE = 'none',
  RECT = 'rect',
  BORDERLESS = 'borderless',
}

export interface ClickableProps extends BaseButtonProps {
  /**
   * Background color that will be dimmed when button is in active state.
   * Only applicable when behavior is RECT.
   */
  underlayColor?: string | undefined;

  /**
   * Opacity applied to the underlay or button when it is in an active state.
   * Defaults to 0.105 for RECT behavior and 0.3 for BORDERLESS behavior.
   */
  activeOpacity?: number | undefined;

  /**
   * Defines how the button visually reacts to being pressed.
   * Defaults to NONE.
   */
  behavior?: ClickableBehavior | undefined;
}

const AnimatedRawButton = Animated.createAnimatedComponent(RawButton as any);

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

export const Clickable = (props: ClickableProps) => {
  const {
    underlayColor = 'black',
    activeOpacity,
    behavior = ClickableBehavior.NONE,
    delayLongPress = 600,
    onLongPress,
    onPress,
    onActiveStateChange,
    style,
    children,
    ...rest
  } = props;

  const resolvedActiveOpacity =
    activeOpacity ?? (behavior === ClickableBehavior.BORDERLESS ? 0.3 : 0.105);

  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const activeState = useRef(new Animated.Value(0)).current;

  const wrappedLongPress = useCallback(() => {
    longPressDetected.current = true;
    onLongPress?.();
  }, [onLongPress]);

  const onBegin = useCallback(
    (e: CallbackEventType) => {
      if (Platform.OS === 'android' && e.pointerInside) {
        longPressDetected.current = false;
        if (onLongPress) {
          longPressTimeout.current = setTimeout(
            wrappedLongPress,
            delayLongPress
          );
        }
      }
    },
    [delayLongPress, onLongPress, wrappedLongPress]
  );

  const onActivate = useCallback(
    (e: CallbackEventType) => {
      onActiveStateChange?.(true);

      const canAnimate =
        behavior === ClickableBehavior.BORDERLESS
          ? Platform.OS === 'ios' // Borderless animates on iOS
          : Platform.OS !== 'android'; // Rect animates everywhere except Android (where native ripple takes over)

      if (behavior !== ClickableBehavior.NONE && canAnimate) {
        activeState.setValue(1);
      }

      if (Platform.OS !== 'android' && e.pointerInside) {
        longPressDetected.current = false;
        if (onLongPress) {
          longPressTimeout.current = setTimeout(
            wrappedLongPress,
            delayLongPress
          );
        }
      }

      if (!e.pointerInside && longPressTimeout.current !== undefined) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    },
    [
      behavior,
      delayLongPress,
      onActiveStateChange,
      onLongPress,
      wrappedLongPress,
      activeState,
    ]
  );

  const onDeactivate = useCallback(
    (e: CallbackEventType, success: boolean) => {
      onActiveStateChange?.(false);

      const canAnimate =
        behavior === ClickableBehavior.BORDERLESS
          ? Platform.OS === 'ios'
          : Platform.OS !== 'android';

      if (behavior !== ClickableBehavior.NONE && canAnimate) {
        activeState.setValue(0);
      }

      if (success && !longPressDetected.current) {
        onPress?.(e.pointerInside);
      }
    },
    [behavior, onActiveStateChange, onPress, activeState]
  );

  const onFinalize = useCallback((_e: CallbackEventType) => {
    if (longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const resolvedStyle = useMemo(() => StyleSheet.flatten(style ?? {}), [style]);

  const underlayAnimatedStyle = useMemo(() => {
    if (behavior !== ClickableBehavior.RECT) {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [0, resolvedActiveOpacity],
      }),
      backgroundColor: underlayColor,
      borderRadius: resolvedStyle.borderRadius,
      borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
      borderTopRightRadius: resolvedStyle.borderTopRightRadius,
      borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
      borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
    };
  }, [
    behavior,
    activeState,
    resolvedActiveOpacity,
    underlayColor,
    resolvedStyle,
  ]);

  const buttonAnimatedStyle = useMemo(() => {
    if (behavior !== ClickableBehavior.BORDERLESS || Platform.OS !== 'ios') {
      return {};
    }

    return {
      opacity: activeState.interpolate({
        inputRange: [0, 1],
        outputRange: [1, resolvedActiveOpacity],
      }),
    };
  }, [behavior, activeState, resolvedActiveOpacity]);

  const ButtonComponent =
    behavior === ClickableBehavior.NONE ? RawButton : AnimatedRawButton;

  return (
    <ButtonComponent
      style={[
        resolvedStyle,
        Platform.OS === 'ios' && { cursor: undefined },
        behavior !== ClickableBehavior.NONE && buttonAnimatedStyle,
      ]}
      {...rest}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}>
      {behavior === ClickableBehavior.RECT && (
        <Animated.View style={[btnStyles.underlay, underlayAnimatedStyle]} />
      )}
      {children}
    </ButtonComponent>
  );
};
