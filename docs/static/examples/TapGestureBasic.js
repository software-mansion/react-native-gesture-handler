import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#b58df1', '#fa7f7c', '#ffe780', '#82cab2'];

export default function App() {
  const colorIndex = useSharedValue(1);

  const tap = Gesture.Tap().onEnd(() => {
    if (colorIndex.value > COLORS.length) {
      colorIndex.value = colorIndex.value % 1 === 0 ? 1 : colorIndex.value % 1;
    }

    const nextIndex = Math.ceil(colorIndex.value + 1);
    colorIndex.value = withTiming(nextIndex, { duration: 250 });
  });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorIndex.value,
      [0, ...COLORS.map((_, i) => i + 1), COLORS.length + 1],
      [COLORS[COLORS.length - 1], ...COLORS, COLORS[0]]
    ),
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={tap}>
        <Animated.View style={[styles.box, animatedStyle]}></Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 100,
    borderRadius: 20,
    cursor: 'pointer',
  },
});
