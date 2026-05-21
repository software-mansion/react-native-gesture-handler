import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePinchGesture } from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';

export default function PinchScreen() {
  const [text, setText] = useState('');

  const pinchGesture = usePinchGesture({
    onBegin: () => {
      setText((prev) => prev + '1');
    },
    onActivate: () => {
      setText((prev) => prev + '2');
    },
    onUpdate: () => {
      // Skip subsequent updates
      if (text[text.length - 1] === '3') {
        return;
      }
      setText((prev) => prev + '3');
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
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.gestureBox} testID="pinch-box" />
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
