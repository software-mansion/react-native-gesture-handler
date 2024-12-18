import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Svg, { Circle, Rect } from 'react-native-svg';

export default function EmptyExample() {
  const circleElementTap = Gesture.Tap().onStart(() =>
    console.log('RNGH: clicked circle')
  );
  const rectElementTap = Gesture.Tap().onStart(() =>
    console.log('RNGH: clicked parallelogram')
  );
  const containerTap = Gesture.Tap().onStart(() =>
    console.log('RNGH: clicked container')
  );
  const vbContainerTap = Gesture.Tap().onStart(() =>
    console.log('RNGH: clicked viewbox container')
  );
  const vbCircleTap = Gesture.Tap().onStart(() =>
    console.log('RNGH: clicked viewbox circle')
  );

  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.header}>
          Overlapping SVGs with gesture detectors
        </Text>
        <View style={{ backgroundColor: 'tomato' }}>
          <GestureDetector gesture={containerTap}>
            <Svg
              height="250"
              width="250"
              onPress={() => console.log('SVG: clicked container')}>
              <GestureDetector gesture={circleElementTap}>
                <Circle
                  cx="125"
                  cy="125"
                  r="125"
                  fill="green"
                  onPress={() => console.log('SVG: clicked circle')}
                />
              </GestureDetector>
              <GestureDetector gesture={rectElementTap}>
                <Rect
                  skewX="45"
                  width="125"
                  height="250"
                  fill="yellow"
                  onPress={() => console.log('SVG: clicked parallelogram')}
                />
              </GestureDetector>
            </Svg>
          </GestureDetector>
        </View>
        <Text>
          Clicks should only be registered while pressing on the green area.
          Pressing the tomato-colored area should not have an effect
        </Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.header}>
          SVG view with ViewBox and pixel dimensions
        </Text>
        <View style={{ backgroundColor: 'tomato' }}>
          <GestureDetector gesture={vbContainerTap}>
            <Svg
              height="250"
              width="250"
              viewBox="-300 -300 600 600"
              onPress={() => console.log('SVG: clicked viewbox container')}>
              <GestureDetector gesture={vbCircleTap}>
                <Circle
                  r="150"
                  fill="green"
                  onPress={() => console.log('SVG: clicked viewbox circle')}
                />
              </GestureDetector>
            </Svg>
          </GestureDetector>
        </View>
        <Text>ViewBox property remaps SVG to user coordinate spaces</Text>
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
