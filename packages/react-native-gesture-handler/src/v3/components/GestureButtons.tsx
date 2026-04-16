import { Animated, Platform, StyleSheet } from 'react-native';
import type {
  BaseButtonProps,
  BorderlessButtonProps,
  RawButtonProps,
  RectButtonProps,
} from './GestureButtonsProps';
import type { GestureEndEvent, GestureEvent } from '../types';
import React, { useRef } from 'react';
import GestureHandlerButton from '../../components/GestureHandlerButton';
import type { NativeHandlerData } from '../hooks/gestures/native/NativeTypes';
import createNativeWrapper from '../createNativeWrapper';

type CallbackEventType = GestureEvent<NativeHandlerData>;
type EndCallbackEventType = GestureEndEvent<NativeHandlerData>;

/**
 * @deprecated `RawButton` is deprecated, use `Clickable` instead
 */
export const RawButton = createNativeWrapper<
  React.ComponentRef<typeof GestureHandlerButton>,
  RawButtonProps
>(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
});

/**
 * @deprecated `BaseButton` is deprecated, use `Touchable` instead
 */
export const BaseButton = (props: BaseButtonProps) => {
  const longPressDetected = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const delayLongPress = props.delayLongPress ?? 600;

  const { onLongPress, onPress, onActiveStateChange, style, ...rest } = props;

  const wrappedLongPress = () => {
    longPressDetected.current = true;
    onLongPress?.();
  };

  const onBegin = (e: CallbackEventType) => {
    if (!e.pointerInside) {
      return;
    }

    onActiveStateChange?.(true);

    longPressDetected.current = false;
    if (onLongPress) {
      longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
    }

    props.onBegin?.(e);
  };

  const onActivate = (e: CallbackEventType) => {
    if (!e.pointerInside && longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }

    props.onActivate?.(e);
  };

  const onDeactivate = (e: EndCallbackEventType) => {
    onActiveStateChange?.(false);

    if (!e.canceled && !longPressDetected.current) {
      onPress?.(e.pointerInside);
    }

    props.onDeactivate?.(e);
  };

  const onFinalize = (e: EndCallbackEventType) => {
    if (longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }

    props.onFinalize?.(e);
  };

  return (
    <RawButton
      style={[style, Platform.OS === 'ios' && { cursor: undefined }]}
      {...rest}
      onBegin={onBegin}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      onFinalize={onFinalize}
    />
  );
};

const AnimatedBaseButton = Animated.createAnimatedComponent(BaseButton);

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

/**
 * @deprecated `RectButton` is deprecated, use `Touchable` with `activeUnderlayOpacity={0.7}` instead
 */
export const RectButton = (props: RectButtonProps) => {
  const {
    children,
    style,
    activeOpacity = 0.105,
    underlayColor = 'black',
    ...rest
  } = props;

  const opacity = useRef(new Animated.Value(0)).current;

  const onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      opacity.setValue(active ? activeOpacity : 0);
    }

    props.onActiveStateChange?.(active);
  };

  const resolvedStyle = StyleSheet.flatten(style ?? {});

  return (
    <BaseButton
      {...rest}
      style={resolvedStyle}
      onActiveStateChange={onActiveStateChange}>
      <Animated.View
        style={[
          btnStyles.underlay,
          {
            opacity,
            backgroundColor: underlayColor,
            borderRadius: resolvedStyle.borderRadius,
            borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
            borderTopRightRadius: resolvedStyle.borderTopRightRadius,
            borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
            borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
          },
        ]}
      />
      {children}
    </BaseButton>
  );
};

/**
 * @deprecated `BorderlessButton` is deprecated, use `Touchable` with `activeOpacity={0.3}` instead
 */
export const BorderlessButton = (props: BorderlessButtonProps) => {
  const activeOpacity = props.activeOpacity ?? 0.3;
  const opacity = useRef(new Animated.Value(1)).current;

  const onActiveStateChange = (active: boolean) => {
    if (Platform.OS === 'ios') {
      opacity.setValue(active ? activeOpacity : 1);
    }

    props.onActiveStateChange?.(active);
  };

  const { children, style, ref, ...rest } = props;

  return (
    <AnimatedBaseButton
      {...rest}
      ref={ref ?? null}
      onActiveStateChange={onActiveStateChange}
      style={[style, Platform.OS === 'ios' && { opacity }]}>
      {children}
    </AnimatedBaseButton>
  );
};

export { default as PureNativeButton } from '../../components/GestureHandlerButton';
