import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import createNativeWrapper from '../handlers/createNativeWrapper';
import GestureHandlerButton from './GestureHandlerButton';
import type {
  BaseButtonProps,
  BorderlessButtonProps,
  RectButtonProps,
} from './GestureButtonsProps';
import { isFabric } from '../utils';
import Animated, {
  processColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { NativeViewGestureHandlerPayload } from '../handlers/GestureHandlerEventPayload';
import { GestureStateChangeEvent } from '../handlers/gestureHandlerCommon';

let IS_FABRIC: null | boolean = null;

type CallbackEventType =
  GestureStateChangeEvent<NativeViewGestureHandlerPayload>;

export const RawButton = createNativeWrapper(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false,
});

export const BaseButton = (props: BaseButtonProps) => {
  let lastActive: boolean;
  let longPressDetected: boolean;
  let longPressTimeout: ReturnType<typeof setTimeout> | undefined;

  const delayLongPress = props.delayLongPress ?? 600;

  const onLongPress = () => {
    longPressDetected = true;
    props.onLongPress?.();
  };

  const onBegin = (e: CallbackEventType) => {
    if (Platform.OS === 'android' && e.pointerInside) {
      longPressDetected = false;
      if (props.onLongPress) {
        longPressTimeout = setTimeout(onLongPress, delayLongPress);
      }
    }

    lastActive = false;
  };

  const onStart = (e: CallbackEventType) => {
    props.onActiveStateChange?.(true);

    if (Platform.OS !== 'android' && e.pointerInside) {
      longPressDetected = false;
      if (props.onLongPress) {
        longPressTimeout = setTimeout(onLongPress, delayLongPress);
      }
    }

    if (!e.pointerInside && longPressTimeout !== undefined) {
      clearTimeout(longPressTimeout);
      longPressTimeout = undefined;
    }

    lastActive = true;
  };

  const onEnd = (e: CallbackEventType) => {
    if (!longPressDetected && props.onPress) {
      props.onPress(e.pointerInside);
    }

    if (lastActive) {
      props.onActiveStateChange?.(false);
    }

    lastActive = false;
  };

  const onFinalize = () => {
    if (lastActive) {
      props.onActiveStateChange?.(false);
    }

    if (longPressTimeout !== undefined) {
      clearTimeout(longPressTimeout);
      longPressTimeout = undefined;
    }
    lastActive = false;
  };

  const { rippleColor: unprocessedRippleColor, style, ref, ...rest } = props;

  if (IS_FABRIC === null) {
    IS_FABRIC = isFabric();
  }

  const rippleColor = IS_FABRIC
    ? unprocessedRippleColor
    : processColor(unprocessedRippleColor ?? undefined);

  return (
    <RawButton
      ref={ref}
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

export const AnimatedBaseButton = BaseButton;

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

  const { children, style, ref, ...rest } = props;

  const resolvedStyle = StyleSheet.flatten(style ?? {});

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <BaseButton
      {...rest}
      ref={ref}
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

  const { children, style, ref, ...rest } = props;

  return (
    <AnimatedBaseButton
      {...rest}
      ref={ref}
      onActiveStateChange={onActiveStateChange}
      style={[style, Platform.OS === 'ios' && { opacity: opacity.value }]}>
      {children}
    </AnimatedBaseButton>
  );
};
