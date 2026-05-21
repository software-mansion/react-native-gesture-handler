import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
} from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';

export default function LongPressScreen() {
  const [text, setText] = useState('');

  const longPressGesture = useLongPressGesture({
    onBegin: () => {
      setText((prev) => prev + '1');
    },
    onActivate: () => {
      setText((prev) => prev + '2');
    },
    onDeactivate: () => {
      setText((prev) => prev + '4');
    },
    onFinalize: () => {
      setText((prev) => prev + '5');
    },
    runOnJS: true,
  });

  return (
    <TestingScreen text={text} setText={setText}>
      <GestureDetector gesture={longPressGesture}>
        <View style={styles.gestureBox} testID="long-press-box" />
      </GestureDetector>
    </TestingScreen>
  );
}

const styles = StyleSheet.create({
  gestureBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
  },
});
