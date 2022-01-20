import { Text, View } from 'react-native';

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

declare const _WORKLET: boolean; // from react-native-reanimated

export function NewAPIReanimatedWorkletUpdateSharedValueExample() {
  const drag = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
      console.log(_WORKLET, 'onBegin');
    })
    .onStart(() => {
      'worklet';
      console.log(_WORKLET, 'onStart');
    })
    .onChange((e) => {
      'worklet';
      drag.value = e.changeX + drag.value;
      console.log(_WORKLET, 'onChange');
    })
    .onEnd((e) => {
      'worklet';
      drag.value = withSpring(0, { velocity: e.velocityX });
      console.log(_WORKLET, 'onEnd');
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
      console.log(_WORKLET, 'onFinalize');
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value }],
      backgroundColor: isPressed.value ? 'black' : 'lime',
    };
  });

  return (
    <View>
      <Text>New API / Reanimated worklet / update shared value</Text>
      <View
        style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <GestureDetector gesture={gesture}>
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
        </GestureDetector>
      </View>
    </View>
  );
}
