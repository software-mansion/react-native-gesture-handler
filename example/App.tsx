import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  RawButton,
} from 'react-native-gesture-handler';

export default function EmptyExample() {
  const native = Gesture.Native();
  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={native}>
        <RawButton
          style={styles.container}
          onActivated={() => console.log('activated')}
        />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    backgroundColor: 'tomato',
  },
});
