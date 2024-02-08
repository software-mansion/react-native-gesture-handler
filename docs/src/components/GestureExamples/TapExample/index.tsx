import React from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { RADIUS, getStylesForExample } from '../utils';

export default function TapExample() {
  const colorModeStyles = getStylesForExample();
  const pressed = useSharedValue(false);

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: pressed.value
      ? 'var(--swm-yellow-dark-80)'
      : 'var(--swm-purple-light-100)',
    // border: pressed.value
    //   ? 'var(--swm-red-dark-80)'
    //   : '8px solid var(--swm-purple-light-80)',
    transform: [{ scale: withTiming(pressed.value ? 1.2 : 1) }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[styles.circle, animatedStyles, colorModeStyles.circle]}
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
