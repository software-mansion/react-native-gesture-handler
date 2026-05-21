import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, useFlingGesture } from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';

export default function FlingScreen() {
  const [text, setText] = useState('');

  const flingGesture = useFlingGesture({
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
      <GestureDetector gesture={flingGesture}>
        <View style={styles.gestureBox} testID="fling-box" />
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
