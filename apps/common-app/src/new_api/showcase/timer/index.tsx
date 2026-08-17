import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, commonStyles, useIndexedLogger } from '../../../common';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function TimerExample() {
  const [lastPress, setLastPress] = useState('none');
  const duration = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const log = useIndexedLogger();
  const animatedProps = useAnimatedProps(() => {
    return {
      text: `Duration: ${duration.value.toFixed(2)}s`,
    } as any;
  });

  const animatedBoxStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [COLORS.PURPLE, COLORS.NAVY]
      ),
    };
  });

  const longPressGesture = useLongPressGesture({
    onBegin: () => {
      log('onBegin');
      colorProgress.value = withTiming(1, { duration: 150 });
      duration.value = 0;
      duration.value = withTiming(600, {
        duration: 600000,
        easing: Easing.linear,
      });
    },
    onActivate: () => {
      log('onActivate');
    },
    onDeactivate: () => {
      log('onDeactivate');
    },
    onFinalize: () => {
      // Rounded, so the summary tolerates press timing jitter.
      const seconds = Math.round(duration.value);
      log(`onFinalize (${seconds}s)`);
      scheduleOnRN(setLastPress, `${seconds}s`);
      colorProgress.value = withTiming(0, { duration: 300 });
      cancelAnimation(duration);
    },
  });

  return (
    <GestureHandlerRootView style={commonStyles.centerView}>
      <View style={styles.container}>
        <AnimatedTextInput
          underlineColorAndroid="transparent"
          editable={false}
          value="Duration: 0.00s"
          style={styles.timerText}
          animatedProps={animatedProps}
        />
        <GestureDetector gesture={longPressGesture}>
          <Animated.View
            testID="timer-box"
            style={[commonStyles.box, animatedBoxStyle]}
          />
        </GestureDetector>
        <Text style={commonStyles.instructions}>
          Hold the box to measure press duration
        </Text>
        <Text testID="last-press-duration" style={styles.lastPressText}>
          Last press: {lastPress}
        </Text>
        <Text style={commonStyles.caption}>rounded to whole seconds</Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.NAVY,
    marginBottom: 20,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lastPressText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.NAVY,
  },
});
