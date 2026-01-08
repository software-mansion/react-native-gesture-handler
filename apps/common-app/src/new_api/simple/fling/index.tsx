import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Directions,
  GestureDetector,
  useFlingGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

export default function FlingExample() {
  const position = useSharedValue(0);
  const beginPosition = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  const flingGesture = useFlingGesture({
    direction: Directions.LEFT | Directions.RIGHT,
    onBegin: (e) => {
      beginPosition.value = e.x;
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onActivate: (e) => {
      const direction = Math.sign(e.x - beginPosition.value);
      position.value = withTiming(position.value + direction * 50, {
        duration: 300,
        easing: Easing.bounce,
      });
    },
    onFinalize: () => {
      colorProgress.value = withTiming(0, {
        duration: 400,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value }],
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [COLORS.NAVY, COLORS.PURPLE]
      ),
    };
  });

  return (
    <View style={styles.centerView}>
      <GestureDetector gesture={flingGesture}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  centerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    height: 120,
    width: 120,
    borderRadius: 20,
    marginBottom: 30,
  },
});
