import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import Svg, { Circle, Rect } from 'react-native-svg';

export default function LogicDetectorExample() {
  const [tappedElement, setTappedElement] = useState('None');

  const circleElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      runOnJS(setTappedElement)('Circle');
    },
  });

  const rectElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      runOnJS(setTappedElement)('Parallelogram');
    },
  });

  const containerTap = useTapGesture({
    onActivate: () => {
      'worklet';
      runOnJS(setTappedElement)('Container');
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Overlapping SVGs with gesture detectors</Text>

      <View style={{ backgroundColor: 'tomato' }}>
        <InterceptingGestureDetector gesture={containerTap}>
          <Svg height="250" width="250">
            <VirtualGestureDetector gesture={circleElementTap}>
              <Circle cx="125" cy="125" r="125" fill="green" />
            </VirtualGestureDetector>
            <VirtualGestureDetector gesture={rectElementTap}>
              <Rect skewX="45" width="125" height="250" fill="yellow" />
            </VirtualGestureDetector>
          </Svg>
        </InterceptingGestureDetector>
      </View>

      <Text style={styles.feedback}>Tapped element: {tappedElement}</Text>
      <Text style={styles.info}>
        Tapping each color updates the above text to reflect which element was
        tapped
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
  },
  feedback: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
  },
});
