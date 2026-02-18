import React, { useRef } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import {
  useLongPressGesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import {
  Feedback,
  FeedbackHandle,
  COLORS,
  commonStyles,
} from '../../../common';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function TimerExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);
  const duration = useSharedValue(0);
  const colorProgress = useSharedValue(0);
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
      colorProgress.value = withTiming(1, { duration: 150 });
      duration.value = 0;
      duration.value = withTiming(600, {
        duration: 600000,
        easing: Easing.linear,
      });
    },
    onFinalize: () => {
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
          <Animated.View style={[commonStyles.box, animatedBoxStyle]} />
        </GestureDetector>
        <Text style={commonStyles.instructions}>
          Hold the box to measure press duration
        </Text>
        <Feedback ref={feedbackRef} />
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
});
