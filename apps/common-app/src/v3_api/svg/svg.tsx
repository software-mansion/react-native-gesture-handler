import { Feedback } from '../../common'; // ✅ imported
import React, { useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';
import Svg, { Circle, Rect } from 'react-native-svg';

export default function LogicDetectorExample() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);

  const circleElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Tapped circle!');
    },
  });

  const rectElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Tapped parallelogram!');
    },
  });

  const containerTap = useTapGesture({
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Tapped container!');
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

      {/* Feedback used here */}
      <Feedback ref={feedbackRef} />
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
});
