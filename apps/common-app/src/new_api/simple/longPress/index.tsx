import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

export default function LongPressExample() {
  const colorProgress = useSharedValue(0);

  const finalise_color = useSharedValue(COLORS.PURPLE);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1, 2],
        [COLORS.NAVY, finalise_color.value, COLORS.KINDA_BLUE]
      ),
    };
  });

  const longPressGesture = useLongPressGesture({
    onBegin: () => {
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onActivate: () => {
      colorProgress.value = withTiming(2, {
        duration: 100,
      });
    },
    onFinalize: (_, success) => {
      finalise_color.value = success ? COLORS.GREEN : COLORS.RED;
      colorProgress.value = 1;
      colorProgress.value = withTiming(
        0,
        {
          duration: 300,
        },
        () => {
          finalise_color.value = COLORS.PURPLE;
        }
      );
    },
  });

  return (
    <View style={styles.centerView}>
      <GestureDetector gesture={longPressGesture}>
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
