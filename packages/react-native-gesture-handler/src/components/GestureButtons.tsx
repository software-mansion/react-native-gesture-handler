import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import createNativeWrapper from '../v3/createNativeWrapper';
import GestureHandlerButton from './GestureHandlerButton';
import type {
  BaseButtonProps,
  BorderlessButtonProps,
  RectButtonProps,
} from './GestureButtonsProps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { GestureStateChangeEvent } from '../v3/types';
import type { NativeViewHandlerData } from '../v3/hooks/gestures/native/useNative';

type CallbackEventType = GestureStateChangeEvent<NativeViewHandlerData>;

export const RawButton = createNativeWrapper(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false,
});

export const BaseButton = (props: BaseButtonProps) => {
  let lastActive: boolean;
  let longPressDetected: boolean;
  let longPressTimeout: ReturnType<typeof setTimeout> | undefined;

  const delayLongPress = props.delayLongPress ?? 600;

  const {
    onLongPress,
    onPress,
    onActiveStateChange,
    rippleColor,
    style,
    ...rest
  } = props;

  const wrappedLongPress = () => {
    longPressDetected = true;
    onLongPress?.();
  };

  const onBegin = (e: CallbackEventType) => {
    if (Platform.OS === 'android' && e.handlerData.pointerInside) {
      longPressDetected = false;
      if (onLongPress) {
        longPressTimeout = setTimeout(wrappedLongPress, delayLongPress);
      }
    }

    lastActive = false;
  };

  const onStart = (e: CallbackEventType) => {
    onActiveStateChange?.(true);

    if (Platform.OS !== 'android' && e.handlerData.pointerInside) {
      longPressDetected = false;
      if (onLongPress) {
        longPressTimeout = setTimeout(wrappedLongPress, delayLongPress);
      }
    }

    if (!e.handlerData.pointerInside && longPressTimeout !== undefined) {
      clearTimeout(longPressTimeout);
      longPressTimeout = undefined;
    }

    lastActive = true;
  };

  const onEnd = (e: CallbackEventType, success: boolean) => {
    if (!success) {
      return;
    }

    if (!longPressDetected && onPress) {
      onPress(e.handlerData.pointerInside);
    }

    if (lastActive) {
      onActiveStateChange?.(false);
    }
  };

  const onFinalize = (_e: CallbackEventType) => {
    if (lastActive) {
      onActiveStateChange?.(false);
    }

    if (longPressTimeout !== undefined) {
      clearTimeout(longPressTimeout);
      longPressTimeout = undefined;
    }
    lastActive = false;
  };

  return (
    <RawButton
      disableReanimated={true}
      rippleColor={rippleColor}
      style={[style, Platform.OS === 'ios' && { cursor: undefined }]}
      {...rest}
      onBegin={onBegin}
      onStart={onStart}
      onEnd={onEnd}
      onFinalize={onFinalize}
    />
  );
};

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

  const opacity = useSharedValue<number>(0);

  const onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      opacity.value = active ? activeOpacity : 0;
    }

    props.onActiveStateChange?.(active);
  };

  const { children, style, ...rest } = props;

  const resolvedStyle = StyleSheet.flatten(style ?? {});

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <BaseButton
      {...rest}
      style={resolvedStyle}
      onActiveStateChange={onActiveStateChange}>
      <Animated.View
        style={[
          btnStyles.underlay,
          {
            backgroundColor: underlayColor,
            borderRadius: resolvedStyle.borderRadius,
            borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
            borderTopRightRadius: resolvedStyle.borderTopRightRadius,
            borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
            borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
          },
          animatedStyle,
        ]}
      />
      {children}
    </BaseButton>
  );
};

export const BorderlessButton = (props: BorderlessButtonProps) => {
  const activeOpacity = props.activeOpacity ?? 0.3;
  const opacity = useSharedValue<number>(1);

  const onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      opacity.value = active ? activeOpacity : 0;
    }

    props.onActiveStateChange?.(active);
  };

  const { children, style, ...rest } = props;

  return (
    <BaseButton
      {...rest}
      onActiveStateChange={onActiveStateChange}
      style={[style, Platform.OS === 'ios' && { opacity: opacity.value }]}>
      {children}
    </BaseButton>
  );
};

export { default as PureNativeButton } from './GestureHandlerButton';
