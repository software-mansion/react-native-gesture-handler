import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  InterceptingGestureDetector,
  VirtualGestureDetector,
  useTapGesture,
} from 'react-native-gesture-handler';

import { COLORS, Feedback } from '../../common';
import { runOnJS } from 'react-native-reanimated';
type Part = 'All Text' | 'try tapping on this part' | 'or on this part' | '';
function NativeDetectorExample() {
  const [tappedPart, setTappedPart] = React.useState<Part>('');
  const resetState = () => {
    setTappedPart('');
  };

  const tapAll = useTapGesture({
    onActivate: () => {
      'worklet';
      console.log('Tapped on text!');
      runOnJS(setTappedPart)('All Text');
    },
  });

  const tapFirstPart = useTapGesture({
    onActivate: () => {
      'worklet';
      console.log('Tapped on first part!');
      runOnJS(setTappedPart)('try tapping on this part');
    },
  });

  const tapSecondPart = useTapGesture({
    onActivate: () => {
      'worklet';
      console.log('Tapped on second part!');
      runOnJS(setTappedPart)('or on this part');
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
      <Feedback
        text={`Tapped part: ${tappedPart}`}
        highlight={tappedPart}
        color={partColors[tappedPart]}
        resetState={resetState}
      />
    </View>
  );
}

function LegacyDetectorExample() {
  const [tappedPart, setTappedPart] = React.useState<Part>('');
  const resetState = () => {
    setTappedPart('');
  };

  const tapAll = Gesture.Tap().onStart(() => {
    'worklet';
    console.log('Tapped on text!');
    runOnJS(setTappedPart)('All Text');
  });

  const tapFirstPart = Gesture.Tap().onStart(() => {
    'worklet';
    console.log('Tapped on first part!');
    runOnJS(setTappedPart)('try tapping on this part');
  });

  const tapSecondPart = Gesture.Tap().onStart(() => {
    'worklet';
    console.log('Tapped on second part!');
    runOnJS(setTappedPart)('or on this part');
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
      <Feedback
        text={`Tapped part: ${tappedPart}`}
        highlight={tappedPart}
        color={partColors[tappedPart]}
        resetState={resetState}
      />
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

const partColors = {
  'All Text': 'BLACK',
  'try tapping on this part': COLORS.NAVY,
  'or on this part': COLORS.KINDA_BLUE,
  '': 'BLACK',
};

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
