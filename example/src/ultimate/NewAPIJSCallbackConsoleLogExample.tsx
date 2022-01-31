import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import React from 'react';

declare const _WORKLET: boolean; // from react-native-reanimated

type Props = {
  color: string;
};

export function NewAPIJSCallbackConsoleLogExample({ color }: Props) {
  const gesture = Gesture.Pan();
  // this syntax ensures that callbacks are not auto-workletized
  gesture
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
        style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <GestureDetector gesture={gesture}>
          <View
            style={{
              width: 45,
              height: 45,
              backgroundColor: color,
            }}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
