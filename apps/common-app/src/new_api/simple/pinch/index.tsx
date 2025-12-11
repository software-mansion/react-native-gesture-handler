import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePinchGesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withTiming,
} from 'react-native-reanimated';

export default function PinchExample() {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const pinchGesture = usePinchGesture({
    onUpdate: (event) => {
      'worklet';
      scale.value = event.scale;

      const p = Math.min(Math.max((event.scale - 1) / 0.5, 0), 1);
      colorProgress.value = p;
    },
    onDeactivate: () => {
      'worklet';
      scale.value = withTiming(1, { duration: 150 });
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
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  return (
    <View style={styles.centerView}>
      <GestureDetector gesture={pinchGesture}>
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
