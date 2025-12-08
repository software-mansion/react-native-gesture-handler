import { COLORS } from '../../common';
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
} from 'react-native-reanimated';

export default function V3Fling() {
  const position = useSharedValue(0);
  const beginPosition = useSharedValue(0);

  const flingGesture = useFlingGesture({
    direction: Directions.LEFT | Directions.RIGHT,
    onBegin: (e) => {
      'worklet';
      beginPosition.value = e.x;
    },
    onActivate: (e) => {
      'worklet';
      const direction = Math.sign(e.x - beginPosition.value);
      position.value = withTiming(position.value + direction * 50, {
        duration: 300,
        easing: Easing.bounce,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

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
    backgroundColor: COLORS.NAVY,
    marginBottom: 30,
  },
});
