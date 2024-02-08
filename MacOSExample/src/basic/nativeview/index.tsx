import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  RectButton,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';

const TestButton = () => (
  <RectButton style={styles.rectButton}>
    <Text>Test button</Text>
  </RectButton>
);

export default function EmptyExample() {
  const native = Gesture.Native();

  return (
    <GestureDetector gesture={native}>
      <TestButton />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rectButton: {
    height: 50,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFC0CB',
  },
});
