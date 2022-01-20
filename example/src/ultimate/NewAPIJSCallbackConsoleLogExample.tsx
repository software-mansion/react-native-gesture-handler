import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import React from 'react';

declare const _WORKLET: boolean; // from react-native-reanimated

export function NewAPIJSCallbackConsoleLogExample() {
  const gesture = Gesture.Pan()
    .onBegin(() => {
      console.log(_WORKLET, 'onBegin');
    })
    .onStart(() => {
      console.log(_WORKLET, 'onStart');
    })
    .onUpdate(() => {
      console.log(_WORKLET, 'onUpdate');
    })
    .onEnd(() => {
      console.log(_WORKLET, 'onEnd');
    })
    .onFinalize(() => {
      console.log(_WORKLET, 'onFinalize');
    });

  return (
    <View>
      <Text>New API / JS callback / console.log</Text>
      <View
        style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <GestureDetector gesture={gesture}>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'red',
            }}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
