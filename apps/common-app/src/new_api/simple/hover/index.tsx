import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, useHoverGesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

export default function TapExample() {
  const colorProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [COLORS.NAVY, COLORS.KINDA_BLUE]
    );
    return {
      backgroundColor,
    };
  });

  const tapGesture = useHoverGesture({
    onBegin: () => {
      'worklet';
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onFinalize: () => {
      'worklet';
      colorProgress.value = withTiming(0, {
        duration: 100,
      });
    },
  });

  return (
    <View style={styles.centerView}>
      <GestureDetector gesture={tapGesture}>
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
