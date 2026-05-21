import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';

export default function TapScreen() {
  const [text, setText] = useState('');

  const tapGesture = useTapGesture({
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
      <GestureDetector gesture={tapGesture}>
        <View style={styles.gestureBox} testID="tap-box" />
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
