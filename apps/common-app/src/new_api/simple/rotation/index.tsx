import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useRotationGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withTiming,
} from 'react-native-reanimated';

export default function RotationExample() {
  const rotation = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  const rotationGesture = useRotationGesture({
    onUpdate: (event) => {
      'worklet';
      rotation.value = event.rotation;
      const p = Math.min(Math.max(Math.abs(event.rotation) / Math.PI, 0), 1);
      colorProgress.value = p;
    },
    onDeactivate: () => {
      'worklet';
      rotation.value = withTiming(0, { duration: 150 });
      colorProgress.value = withTiming(0, { duration: 150 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [COLORS.NAVY, COLORS.KINDA_BLUE]
    );

    return {
      transform: [{ rotateZ: `${rotation.value}rad` }],
      backgroundColor,
    };
  });

  return (
    <View style={styles.centerView}>
      <GestureDetector gesture={rotationGesture}>
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
    marginBottom: 100,
  },
});
