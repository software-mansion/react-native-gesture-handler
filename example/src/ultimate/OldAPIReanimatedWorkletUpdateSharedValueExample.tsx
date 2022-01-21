import { Text, View } from 'react-native';

import React from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

declare const _WORKLET: boolean; // from react-native-reanimated

export function OldAPIReanimatedWorkletUpdateSharedValueExample() {
  const drag = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const eventHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
      isPressed.value = true;
      console.log(_WORKLET, 'onStart');
    },
    onActive: (e) => {
      'worklet';
      drag.value = e.translationX;
      console.log(_WORKLET, 'onActive');
    },
    onEnd: () => {
      'worklet';
      console.log(_WORKLET, 'onEnd');
    },
    onFail: () => {
      'worklet';
      console.log(_WORKLET, 'onFail');
    },
    onCancel: () => {
      'worklet';
      console.log(_WORKLET, 'onCancel');
    },
    onFinish: (e) => {
      'worklet';
      drag.value = withSpring(0, { velocity: e.velocityX });
      isPressed.value = false;
      console.log(_WORKLET, 'onFinish');
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value }],
      backgroundColor: isPressed.value ? 'black' : 'gray',
    };
  });

  return (
    <View>
      <Text>Old API / Reanimated worklet / update shared value</Text>
      <View
        style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <PanGestureHandler maxPointers={1} onGestureEvent={eventHandler}>
          <Animated.View
            style={[
              {
                width: 50,
                height: 50,
                backgroundColor: 'red',
                alignItems: 'center',
                justifyContent: 'center',
              },
              animatedStyle,
            ]}
          />
        </PanGestureHandler>
      </View>
    </View>
  );
}
