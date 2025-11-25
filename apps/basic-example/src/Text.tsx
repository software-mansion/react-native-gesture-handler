import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  InterceptingGestureDetector,
  VirtualGestureDetector,
  useTapGesture,
} from 'react-native-gesture-handler';

import { COLORS } from './colors';

function NativeDetectorExample() {
  const tapAll = useTapGesture({
    onStart: () => {
      'worklet';
      console.log('Tapped on text!');
    },
  });

  const tapFirstPart = useTapGesture({
    onStart: () => {
      'worklet';
      console.log('Tapped on first part!');
    },
  });

  const tapSecondPart = useTapGesture({
    onStart: () => {
      'worklet';
      console.log('Tapped on second part!');
    },
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
              {' '}
              try tapping on this part
            </Text>
          </VirtualGestureDetector>
          <VirtualGestureDetector gesture={tapSecondPart}>
            <Text style={{ fontSize: 28, color: COLORS.KINDA_BLUE }}>
              {' '}
              or on this part
            </Text>
          </VirtualGestureDetector>
          this part is not special :(
        </Text>
      </InterceptingGestureDetector>
    </View>
  );
}

function LegacyDetectorExample() {
  const tapAll = Gesture.Tap().onStart(() => {
    'worklet';
    console.log('Tapped on text!');
  });

  const tapFirstPart = Gesture.Tap().onStart(() => {
    'worklet';
    console.log('Tapped on first part!');
  });

  const tapSecondPart = Gesture.Tap().onStart(() => {
    'worklet';
    console.log('Tapped on second part!');
  });

  return (
    <View style={styles.subcontainer}>
      <Text style={styles.header}>
        Legacy Detector example - this one shouldn't work
      </Text>
      <GestureDetector gesture={tapAll}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>
          Some text example running with RNGH
          <GestureDetector gesture={tapFirstPart}>
            <Text style={{ fontSize: 24, color: COLORS.NAVY }}>
              {' '}
              try tapping on this part
            </Text>
          </GestureDetector>
          <GestureDetector gesture={tapSecondPart}>
            <Text style={{ fontSize: 28, color: COLORS.KINDA_BLUE }}>
              {' '}
              or on this part
            </Text>
          </GestureDetector>
          this part is not special :(
        </Text>
      </GestureDetector>
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
