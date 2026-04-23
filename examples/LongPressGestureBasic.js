import React from 'react';
import {
  GestureDetector,
  GestureHandlerRootView,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import { Easing, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#b58df1', '#fa7f7c', '#ffe780', '#82cab2'];
const easing = Easing.bezier(0.31, 0.04, 0.03, 1.04);

export default function App() {
  const colorIndex = useSharedValue(0);
  const nextColorIndex = useSharedValue(0);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const longPress = useLongPressGesture({
    onBegin: () => {
      scale.value = withTiming(1.2, {
        duration: 500,
        easing: easing,
      });
    },
    onActivate: () => {
      colorIndex.value = nextColorIndex.value;
      nextColorIndex.value = (colorIndex.value + 1) % COLORS.length;
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 500,
        easing: easing,
      });
    },
    onFinalize: () => {
      scale.value = withTiming(1, {
        duration: 250,
        easing: easing,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS[colorIndex.value], COLORS[nextColorIndex.value]]
    ),
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={longPress}>
        <Animated.View style={[styles.box, animatedStyle]} />
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
