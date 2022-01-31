import { Text, View } from 'react-native';

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

declare const _WORKLET: boolean; // from react-native-reanimated

type Props = {
  color: string;
};

export function NewAPIReanimatedWorkletConsoleLogExample({ color }: Props) {
  const gesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      console.log(_WORKLET, 'onBegin');
    })
    .onStart(() => {
      'worklet';
      console.log(_WORKLET, 'onStart');
    })
    .onUpdate(() => {
      'worklet';
      console.log(_WORKLET, 'onUpdate');
    })
    .onEnd(() => {
      'worklet';
      console.log(_WORKLET, 'onEnd');
    })
    .onFinalize(() => {
      'worklet';
      console.log(_WORKLET, 'onFinalize');
    });

  return (
    <View>
      <Text>New API / Reanimated worklet / console.log</Text>
      <View
        style={{
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <GestureDetector gesture={gesture}>
          <View
            style={{
              width: 45,
              height: 45,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
