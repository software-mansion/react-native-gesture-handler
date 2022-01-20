import { Text, View } from 'react-native';

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

declare const _WORKLET: boolean; // from react-native-reanimated

export function NewAPIReanimatedWorkletConsoleLogExample() {
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
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <GestureDetector gesture={gesture}>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'darkorange',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
