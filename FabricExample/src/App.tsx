import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

export default function EmptyExample() {
  const tap = Gesture.Native();
  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={tap}>
        <View style={styles.container} />
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
