import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, commonStyles } from '../../../common';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';

export default function TapExample() {
  const colorProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [COLORS.NAVY, COLORS.KINDA_BLUE]
      ),
    };
  });

  const tapGesture = useTapGesture({
    onBegin: () => {
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onFinalize: () => {
      colorProgress.value = withTiming(0, {
        duration: 100,
      });
    },
  });

  return (
    <View style={commonStyles.centerView}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[commonStyles.box, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}
