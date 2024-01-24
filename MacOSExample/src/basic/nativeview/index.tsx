import React from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import {
  GestureDetector,
  Gesture,
  RectButton,
} from 'react-native-gesture-handler';

export default function App() {
  const native = Gesture.Native();

  return (
    <RectButton
      style={[styles.button]}
      onPress={() => console.log('test button clicked')}>
      <Text>test button</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  button: {
    backgroundColor: 'plum',
  },
});
