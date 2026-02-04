import React from 'react';
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width } = Dimensions.get('screen');

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export default function App() {
  const translateX = useSharedValue(0);
  const startTranslateX = useSharedValue(0);

  const fling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .onBegin((event) => {
      startTranslateX.value = event.x;
    })
    .onStart((event) => {
      translateX.value = withTiming(
        clamp(
          translateX.value + event.x - startTranslateX.value,
          width / -2 + 50,
          width / 2 - 50
        ),
        { duration: 200 }
      );
    })
    .runOnJS(true);

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={fling}>
        <Animated.View style={[styles.box, boxAnimatedStyles]}></Animated.View>
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
    backgroundColor: '#b58df1',
    cursor: 'grab',
  },
});
