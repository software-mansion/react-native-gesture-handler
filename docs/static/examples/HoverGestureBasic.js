import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function App() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const hover = Gesture.Hover()
    .onStart((event) => {
      startX.value = event.x;
      startY.value = event.y;
    })
    .onUpdate((event) => {
      translateX.value = (event.x - startX.value) * 0.3;
      translateY.value = (event.y - startY.value) * 0.3;
    })
    .onEnd(() => {
      translateX.value = withTiming(0, {
        duration: 400,
        easing: Easing.bezier(1, -1, 0.3, 1.43),
      });
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.bezier(1, -1, 0.3, 1.43),
      });
    });

  const boxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={hover}>
        <Animated.View style={[styles.box, boxAnimatedStyle]}></Animated.View>
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
    cursor: 'pointer',
  },
});