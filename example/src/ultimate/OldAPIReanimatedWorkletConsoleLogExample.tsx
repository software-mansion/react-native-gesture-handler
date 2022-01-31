import { Text, View } from 'react-native';

import React from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler } from 'react-native-reanimated';

declare const _WORKLET: boolean; // from react-native-reanimated

type Props = {
  color: string;
};

export function OldAPIReanimatedWorkletConsoleLogExample({ color }: Props) {
  const eventHandler = useAnimatedGestureHandler({
    onActive: () => {
      'worklet';
      console.log(_WORKLET, 'onActive');
    },
    onStart: () => {
      'worklet';
      console.log(_WORKLET, 'onStart');
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
    onFinish: () => {
      'worklet';
      console.log(_WORKLET, 'onFinish');
    },
  });

  return (
    <View>
      <Text>Old API / Reanimated worklet / console.log</Text>
      <View
        style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <PanGestureHandler maxPointers={1} onGestureEvent={eventHandler}>
          <Animated.View
            style={{
              width: 45,
              height: 45,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </PanGestureHandler>
      </View>
    </View>
  );
}
