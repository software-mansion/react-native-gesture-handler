import React, { useRef } from 'react';
import { Platform, StyleSheet, Animated } from 'react-native';
import createNativeWrapper from '../createNativeWrapper';
import GestureHandlerButton from '../../components/GestureHandlerButton';
import type {
  BaseButtonProps,
  BorderlessButtonProps,
  RectButtonProps,
} from './GestureButtonsProps';

import type { GestureStateChangeEvent } from '../types';
import type { NativeViewHandlerData } from '../hooks/gestures/native/useNativeGesture';

type CallbackEventType = GestureStateChangeEvent<NativeViewHandlerData>;

export const RawButton = createNativeWrapper(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false,
});

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
    if (Platform.OS === 'android' && e.pointerInside) {
      longPressDetected.current = false;
      if (onLongPress) {
        longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
      }
    }
  };

  const onStart = (e: CallbackEventType) => {
    onActiveStateChange?.(true);

    if (Platform.OS !== 'android' && e.pointerInside) {
      longPressDetected.current = false;
      if (onLongPress) {
        longPressTimeout.current = setTimeout(wrappedLongPress, delayLongPress);
      }
    }

    if (!e.pointerInside && longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  };

  const onEnd = (e: CallbackEventType, success: boolean) => {
    onActiveStateChange?.(false);

    if (success && !longPressDetected.current) {
      onPress?.(e.pointerInside);
    }
  };

  const onFinalize = (_e: CallbackEventType) => {
    if (longPressTimeout.current !== undefined) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  };

  return (
    <RawButton
      style={[style, Platform.OS === 'ios' && { cursor: undefined }]}
      {...rest}
      onBegin={onBegin}
      onStart={onStart}
      onEnd={onEnd}
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

export const RectButton = (props: RectButtonProps) => {
  const activeOpacity = props.activeOpacity ?? 0.105;
  const underlayColor = props.underlayColor ?? 'black';

  const opacity = useRef(new Animated.Value(0)).current;

  const onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      opacity.setValue(active ? activeOpacity : 0);
    }

    props.onActiveStateChange?.(active);
  };

  const { children, style, ...rest } = props;

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

export const BorderlessButton = (props: BorderlessButtonProps) => {
  const activeOpacity = props.activeOpacity ?? 0.3;
  const opacity = useRef(new Animated.Value(1)).current;

  const onActiveStateChange = (active: boolean) => {
    if (Platform.OS === 'ios') {
      opacity.setValue(active ? activeOpacity : 1);
    }

    props.onActiveStateChange?.(active);
  };

  const { children, style, ...rest } = props;

  return (
    <AnimatedBaseButton
      {...rest}
      onActiveStateChange={onActiveStateChange}
      style={[style, Platform.OS === 'ios' && { opacity }]}>
      {children}
    </AnimatedBaseButton>
  );
};

export { default as PureNativeButton } from '../../components/GestureHandlerButton';
