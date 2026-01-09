import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  InterceptingGestureDetector,
  VirtualGestureDetector,
  useTapGesture,
} from 'react-native-gesture-handler';

import { COLORS, Feedback } from '../../../common';

function NativeDetectorExample() {
  const feedbackRef = React.useRef<{ showMessage: (msg: string) => void }>(
    null
  );

  const tapAll = useTapGesture({
    onActivate: () => {
      feedbackRef.current?.showMessage('Tapped on all text');
    },
    disableReanimated: true,
  });

  const tapFirstPart = useTapGesture({
    onActivate: () => {
      feedbackRef.current?.showMessage('Tapped on "try tapping on this part"');
    },
    disableReanimated: true,
  });

  const tapSecondPart = useTapGesture({
    onActivate: () => {
      feedbackRef.current?.showMessage('Tapped on "or on this part"');
    },
    disableReanimated: true,
  });

  return (
    <View style={styles.subcontainer}>
      <Text style={styles.header}>
        Native Detector example - this one should work
      </Text>
      <InterceptingGestureDetector gesture={tapAll}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>
          Some text example running with RNGH
          <VirtualGestureDetector gesture={tapFirstPart}>
            <Text style={{ fontSize: 24, color: COLORS.NAVY }}>
              try tapping on this part
            </Text>
          </VirtualGestureDetector>
          <VirtualGestureDetector gesture={tapSecondPart}>
            <Text style={{ fontSize: 28, color: COLORS.KINDA_BLUE }}>
              or on this part
            </Text>
          </VirtualGestureDetector>
          this part is not special :(
        </Text>
      </InterceptingGestureDetector>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

function LegacyDetectorExample() {
  const feedbackRef = React.useRef<{ showMessage: (msg: string) => void }>(
    null
  );

  const tapAll = Gesture.Tap().onStart(() => {
    feedbackRef.current?.showMessage('Tapped on all text');
  });

  const tapFirstPart = Gesture.Tap().onStart(() => {
    feedbackRef.current?.showMessage('Tapped on "try tapping on this part"');
  });

  const tapSecondPart = Gesture.Tap().onStart(() => {
    feedbackRef.current?.showMessage('Tapped on "or this part"');
  });

  return (
    <View style={styles.subcontainer}>
      <Text style={styles.header}>
        Legacy Detector example - this one should only work on web
      </Text>
      <GestureDetector gesture={tapAll}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>
          Some text example running with RNGH
          <GestureDetector gesture={tapFirstPart}>
            <Text style={{ fontSize: 24, color: COLORS.NAVY }}>
              try tapping on this part
            </Text>
          </GestureDetector>
          <GestureDetector gesture={tapSecondPart}>
            <Text style={{ fontSize: 28, color: COLORS.KINDA_BLUE }}>
              or on this part
            </Text>
          </GestureDetector>
          this part is not special :(
        </Text>
      </GestureDetector>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

export default function NativeTextExample() {
  return (
    <View style={styles.container}>
      <NativeDetectorExample />
      <LegacyDetectorExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subcontainer: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
