import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import React from 'react';
import { View } from 'react-native';

export default function App() {
  const gesture = Gesture.Pan()
    .onBegan(() => {
      console.log('onBegan');
    })
    .onUpdate((e) => {
      console.log('onUpdate');
    })
    .onEnd(() => {
      console.log('onEnd');
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'yellow',
        }}>
        <GestureDetector gesture={gesture}>
          <View style={{ width: 120, height: 120, backgroundColor: 'red' }} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
