import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Easing, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#b58df1', '#fa7f7c', '#ffe780', '#82cab2'];

export default function App() {
  const colorIndex = useSharedValue(0);
  const scale = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .onBegin(() => {
      scale.value = withTiming(1.2, {
        duration: 500,
        easing: Easing.bezier(0.31, 0.04, 0.03, 1.04),
      });
    })
    .onStart(() => {
      colorIndex.value = withTiming(
        (colorIndex.value + 1) % (COLORS.length + 1),
        { duration: 200 },
        () => {
          if (colorIndex.value === COLORS.length) {
            colorIndex.value = 0;
          }
        }
      );
    })
    .onFinalize(() => {
      scale.value = withTiming(1, {
        duration: 250,
        easing: Easing.bezier(0.82, 0.06, 0.42, 1.01),
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorIndex.value,
      [...COLORS.map((_, i) => i), COLORS.length],
      [...COLORS, COLORS[0]]
    ),
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={longPress}>
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
