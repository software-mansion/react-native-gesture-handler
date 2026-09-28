import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  GestureStateManager,
  usePanGesture,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function EmptyExample() {
  const pan = usePanGesture({
    onBegin: () => console.log('pan onBegin'),
    onFinalize: () => console.log('pan onFinalize'),
  });

  const tap = useTapGesture({
    onActivate: () => GestureStateManager.fail(pan.handlerTag),
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text>1. Tap blue (fails the untouched pan)</Text>
      <GestureDetector gesture={tap}>
        <View style={[styles.box, { backgroundColor: '#3b82f6' }]} />
      </GestureDetector>
      <Text>2. Touch red</Text>
      <GestureDetector gesture={pan}>
        <View style={[styles.box, { backgroundColor: '#ef4444' }]} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  box: { width: 160, height: 160, borderRadius: 12 },
});
