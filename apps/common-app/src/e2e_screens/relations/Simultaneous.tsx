import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';
import { CallbackIDs } from '../utils';

export default function SimultaneousScreen() {
  const [text, setText] = useState('');

  const pan1Callbacks = useRef(new Set<string>());
  const pan2Callbacks = useRef(new Set<string>());

  const pan1Gesture = usePanGesture({
    onBegin: () => {
      pan1Callbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      pan1Callbacks.current.add(CallbackIDs.onActivate);
    },
    onUpdate: () => {
      pan1Callbacks.current.add(CallbackIDs.onUpdate);
    },
    onDeactivate: () => {
      pan1Callbacks.current.add(CallbackIDs.onDeactivate);
    },
    onFinalize: () => {
      pan1Callbacks.current.add(CallbackIDs.onFinalize);
    },
    runOnJS: true,
  });

  const pan2Gesture = usePanGesture({
    onBegin: () => {
      pan2Callbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      pan2Callbacks.current.add(CallbackIDs.onActivate);
    },
    onUpdate: () => {
      pan2Callbacks.current.add(CallbackIDs.onUpdate);
    },
    onDeactivate: () => {
      pan2Callbacks.current.add(CallbackIDs.onDeactivate);
    },
    onFinalize: () => {
      pan2Callbacks.current.add(CallbackIDs.onFinalize);
    },
    runOnJS: true,
  });

  const g = useSimultaneousGestures(pan1Gesture, pan2Gesture);

  return (
    <TestingScreen
      text={text}
      buttonCallback={() => {
        const pan1CallbacksText = Array.from(pan1Callbacks.current).join('');
        const pan2CallbacksText = Array.from(pan2Callbacks.current).join('');

        setText(`{Pan1: ${pan1CallbacksText}, Pan2: ${pan2CallbacksText}}`);

        pan1Callbacks.current.clear();
        pan2Callbacks.current.clear();
      }}>
      <GestureDetector gesture={g}>
        <View style={styles.gestureBox} testID="simultaneous-box" />
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
