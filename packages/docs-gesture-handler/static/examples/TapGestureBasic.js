import React from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#b58df1', '#fa7f7c', '#ffe780', '#82cab2'];

export default function App() {
  const currentIndex = useSharedValue(0);
  const nextIndex = useSharedValue(0);
  const progress = useSharedValue(0);

  const tap = useTapGesture({
    onActivate: () => {
      currentIndex.value = nextIndex.value;
      nextIndex.value = (nextIndex.value + 1) % COLORS.length;
      progress.value = 0;
      progress.value = withTiming(1, { duration: 250 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS[currentIndex.value], COLORS[nextIndex.value]]
    ),
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={tap}>
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
    aspectRatio: 1,
    borderRadius: 20,
    cursor: 'pointer',
  },
});
