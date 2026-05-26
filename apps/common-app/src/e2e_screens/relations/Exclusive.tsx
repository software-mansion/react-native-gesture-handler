import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useExclusiveGestures,
  useTapGesture,
} from 'react-native-gesture-handler';

import TestingScreen from '../TestingScreen';
import { CallbackIDs } from '../utils';

export default function ExclusiveScreen() {
  const [text, setText] = useState('');

  const tapCallbacks = useRef(new Set<string>());
  const doubleTapCallbacks = useRef(new Set<string>());

  const doubleTapGesture = useTapGesture({
    numberOfTaps: 2,
    onBegin: () => {
      doubleTapCallbacks.current.add(CallbackIDs.onBegin);
    },
    onActivate: () => {
      doubleTapCallbacks.current.add(CallbackIDs.onActivate);
    },
    onDeactivate: () => {
      doubleTapCallbacks.current.add(CallbackIDs.onDeactivate);
    },
    onFinalize: () => {
      doubleTapCallbacks.current.add(CallbackIDs.onFinalize);
    },
    runOnJS: true,
  });

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

  const g = useExclusiveGestures(doubleTapGesture, tapGesture);

  return (
    <TestingScreen
      text={text}
      buttonCallback={() => {
        const tapCallbacksText = Array.from(tapCallbacks.current).join('');
        const doubleTapCallbacksText = Array.from(
          doubleTapCallbacks.current
        ).join('');

        setText(
          `{DoubleTap: ${doubleTapCallbacksText}, Tap: ${tapCallbacksText}}`
        );

        tapCallbacks.current.clear();
        doubleTapCallbacks.current.clear();
      }}>
      <GestureDetector gesture={g}>
        <View style={styles.gestureBox} testID="exclusive-box" />
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
