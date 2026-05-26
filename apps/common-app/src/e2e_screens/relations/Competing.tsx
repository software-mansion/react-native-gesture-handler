import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useCompetingGestures,
  usePanGesture,
  useTapGesture,
} from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';
import { CallbackIDs } from '../utils';

export default function CompetingScreen() {
  const [text, setText] = useState('');

  const panCallbacks = useRef(new Set<string>());
  const tapCallbacks = useRef(new Set<string>());

  const tapGesture = useTapGesture({
    onBegin: () => {
      tapCallbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      tapCallbacks.current.add(CallbackIDs.onActivate);
    },
    onDeactivate: () => {
      tapCallbacks.current.add(CallbackIDs.onDeactivate);
    },
    onFinalize: () => {
      tapCallbacks.current.add(CallbackIDs.onFinalize);
    },
    runOnJS: true,
  });

  const panGesture = usePanGesture({
    onBegin: () => {
      panCallbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      panCallbacks.current.add(CallbackIDs.onActivate);
    },
    onUpdate: () => {
      panCallbacks.current.add(CallbackIDs.onUpdate);
    },
    onDeactivate: () => {
      panCallbacks.current.add(CallbackIDs.onDeactivate);
    },
    onFinalize: () => {
      panCallbacks.current.add(CallbackIDs.onFinalize);
    },
    runOnJS: true,
  });

  const g = useCompetingGestures(tapGesture, panGesture);

  return (
    <TestingScreen
      text={text}
      buttonCallback={() => {
        const panCallbacksText = Array.from(panCallbacks.current).join('');
        const tapCallbacksText = Array.from(tapCallbacks.current).join('');

        setText(`{Pan: ${panCallbacksText}, Tap: ${tapCallbacksText}}`);

        panCallbacks.current.clear();
        tapCallbacks.current.clear();
      }}>
      <GestureDetector gesture={g}>
        <View style={styles.gestureBox} testID="competing-box" />
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
