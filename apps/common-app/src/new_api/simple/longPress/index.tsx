import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, commonStyles, useIndexedLogger } from '../../../common';

export default function LongPressExample() {
  const log = useIndexedLogger();
  const [count, setCount] = useState(0);

  const incrementCount = useCallback(() => setCount((c) => c + 1), []);

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
      log('onBegin');
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onActivate: () => {
      log('onActivate');
      scheduleOnRN(incrementCount);
      colorProgress.value = withTiming(2, {
        duration: 100,
      });
    },
    onDeactivate: () => {
      log('onDeactivate');
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onFinalize: (e) => {
      log('onFinalize');
      finalise_color.value = e.canceled ? COLORS.RED : COLORS.GREEN;
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
      <Text style={commonStyles.header}>Long press count: {count}</Text>
      <GestureDetector gesture={longPressGesture}>
        <Animated.View
          testID="long-press-box"
          style={[commonStyles.box, animatedStyle]}
        />
      </GestureDetector>
    </View>
  );
}
