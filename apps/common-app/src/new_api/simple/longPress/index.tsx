import { COLORS, commonStyles } from '../../../common';
import React from 'react';
import { View } from 'react-native';
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
    <View style={commonStyles.centerView}>
      <GestureDetector gesture={longPressGesture}>
        <Animated.View style={[commonStyles.box, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}
