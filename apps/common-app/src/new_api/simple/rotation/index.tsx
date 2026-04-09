import { COLORS, commonStyles } from '../../../common';
import React from 'react';
import { View } from 'react-native';
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
      rotation.value = event.rotation;
      const p = Math.min(Math.max(Math.abs(event.rotation) / Math.PI, 0), 1);
      colorProgress.value = p;
    },
    onDeactivate: () => {
      rotation.value = withTiming(0, { duration: 150 });
      colorProgress.value = withTiming(0, { duration: 150 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}rad` }],
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [COLORS.NAVY, COLORS.KINDA_BLUE]
      ),
    };
  });

  return (
    <View style={commonStyles.centerView}>
      <GestureDetector gesture={rotationGesture}>
        <Animated.View style={[commonStyles.box, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}
