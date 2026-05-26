import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useRotationGesture,
} from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';
import { CallbackIDs } from '../utils';

export default function RotationScreen() {
  const [text, setText] = useState('');
  const callbacks = useRef(new Set<string>());

  const rotationGesture = useRotationGesture({
    onBegin: () => {
      callbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      callbacks.current.add(CallbackIDs.onActivate);
    },
    onUpdate: () => {
      callbacks.current.add(CallbackIDs.onUpdate);
    },
    onDeactivate: () => {
      callbacks.current.add(CallbackIDs.onDeactivate);
    },
    onFinalize: () => {
      callbacks.current.add(CallbackIDs.onFinalize);
    },
    runOnJS: true,
  });

  return (
    <TestingScreen
      text={text}
      buttonCallback={() => {
        setText(`{Rotation: ${Array.from(callbacks.current).join('')}}`);
        callbacks.current.clear();
      }}>
      <GestureDetector gesture={rotationGesture}>
        <View style={styles.gestureBox} testID="rotation-box" />
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
