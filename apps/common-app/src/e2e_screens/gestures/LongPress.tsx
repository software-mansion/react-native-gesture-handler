import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
} from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';
import { CallbackIDs } from '../utils';

export default function LongPressScreen() {
  const [text, setText] = useState('');
  const callbacks = useRef(new Set<string>());

  const longPressGesture = useLongPressGesture({
    onBegin: () => {
      callbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      callbacks.current.add(CallbackIDs.onActivate);
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
        setText(`{LongPress: ${Array.from(callbacks.current).join('')}}`);
        callbacks.current.clear();
      }}>
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
