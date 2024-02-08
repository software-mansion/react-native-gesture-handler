import React from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Directions } from 'react-native-gesture-handler';
import { RADIUS, isInsideCircle, getStylesForExample } from '../utils';

export default function FLingExample() {
  const colorModeStyles = getStylesForExample();
  const startPositionX = useSharedValue(0);
  const endPositionX = useSharedValue(0);
  const startPositionY = useSharedValue(0);
  const endPositionY = useSharedValue(0);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  const flingGesture = Gesture.Fling()
    .direction(
      Directions.UP | Directions.DOWN | Directions.LEFT | Directions.RIGHT
    )
    .onBegin((e) => {
      startPositionX.value = e.x;
      startPositionY.value = e.y;
    })
    .onEnd((e) => {
      endPositionX.value = e.x;
      endPositionY.value = e.y;
    })
    .onStart((e) => {
      if (endPositionX.value === 0) endPositionX.value = e.x;
      if (endPositionY.value === 0) endPositionY.value = e.y;

      const valueX = Math.abs(startPositionX.value - endPositionX.value);
      const valueY = Math.abs(startPositionY.value - endPositionY.value);

      positionX.value =
        startPositionX.value < endPositionX.value
          ? positionX.value + e.x < 100
            ? withTiming(positionX.value + valueX, { duration: 100 })
            : 100
          : positionX.value - e.x > -100
          ? withTiming(positionX.value - valueX, { duration: 100 })
          : -100;
      positionY.value =
        startPositionY.value < endPositionY.value
          ? positionY.value + valueY < 100
            ? withTiming(positionY.value + valueY, { duration: 100 })
            : 100
          : positionY.value - valueY > -100
          ? withTiming(positionY.value - valueY, { duration: 100 })
          : -100;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          isInsideCircle(positionX.value, positionY.value) && positionX.value,
      },
      {
        translateY:
          isInsideCircle(positionX.value, positionY.value) && positionY.value,
      },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={flingGesture}>
        <Animated.View
          style={[styles.circle, animatedStyle, colorModeStyles.circle]}
        />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 2 * RADIUS,
    width: 2 * RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    height: 56,
    cursor: 'pointer',
    width: 56,
    border: '8px solid var(--swm-purple-light-80)',
    backgroundColor: 'var(--swm-purple-light-100)',
    borderRadius: 100,
  },
});
