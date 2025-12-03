import { Feedback } from '../../common';
import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import Svg, { Circle, Rect } from 'react-native-svg';

type Element = 'circle!' | 'parallelogram!' | 'container!' | '';
export default function LogicDetectorExample() {
  const [tappedElement, setTappedElement] = useState<Element>('');
  const resetState = () => {
    setTappedElement('');
  };

  const circleElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      console.log('clicked on Circle');
      runOnJS(setTappedElement)('circle!');
    },
  });

  const rectElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      console.log('clicked on Parallelogram');
      runOnJS(setTappedElement)('parallelogram!');
    },
  });

  const containerTap = useTapGesture({
    onActivate: () => {
      'worklet';
      console.log('clicked on container');
      runOnJS(setTappedElement)('container!');
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

      <Feedback
        text={`Tapped: ${tappedElement}`}
        highlight={tappedElement}
        color={partColors[tappedElement]}
        resetState={resetState}
      />
    </View>
  );
}

const partColors = {
  'circle!': 'green',
  'parallelogram!': 'yellow',
  'container!': 'tomato',
  '': 'BLACK',
};

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
});
