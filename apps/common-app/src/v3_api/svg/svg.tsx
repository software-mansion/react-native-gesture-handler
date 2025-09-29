import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {
  NativeDetector,
  LogicDetector,
  useTap,
} from 'react-native-gesture-handler';

import Svg, { Circle, Rect } from 'react-native-svg';

export default function LogicDetectorExample() {
  const circleElementTap = useTap({
    onStart: () => {
      'worklet';
      console.log('clicked circle');
    },
  });
  const rectElementTap = useTap({
    onStart: () => {
      'worklet';
      console.log('clicked parallelogram');
    },
  });
  const containerTap = useTap({
    onStart: () => {
      'worklet';
      console.log('clicked container');
    },
  });

  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.header}>
          Overlapping SVGs with gesture detectors
        </Text>
        <View style={{ backgroundColor: 'tomato' }}>
          <NativeDetector gesture={containerTap}>
            <Svg height="250" width="250">
              <LogicDetector gesture={circleElementTap}>
                <Circle cx="125" cy="125" r="125" fill="green" />
              </LogicDetector>
              <LogicDetector gesture={rectElementTap}>
                <Rect skewX="45" width="125" height="250" fill="yellow" />
              </LogicDetector>
            </Svg>
          </NativeDetector>
        </View>
        <Text>
          Tapping each color should read to a different console.log output
        </Text>
      </View>
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
