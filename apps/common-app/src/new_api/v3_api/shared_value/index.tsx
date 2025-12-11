import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
  usePanGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withTiming,
} from 'react-native-reanimated';

export default function PanExample() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const maxLongPressDistance = useSharedValue(20);
  const panGesture = usePanGesture({
    onBegin: () => {
      'worklet';
      colorProgress.value = withTiming(1, { duration: 150 });
    },
    onUpdate: (event) => {
      'worklet';
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
      maxLongPressDistance.value = Math.abs(event.translationY) * 2 + 20;
    },
    onFinalize: () => {
      'worklet';
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    },
  });

  const longPressGesture = useLongPressGesture({
    onBegin: () => {
      'worklet';
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onActivate: () => {
      'worklet';
      colorProgress.value = withTiming(2, {
        duration: 100,
      });
    },
    onFinalize: () => {
      'worklet';
      colorProgress.value = withTiming(0, {
        duration: 100,
      });
    },
    minDuration: 1000,
    maxDistance: maxLongPressDistance,
  });

  const gestures = useSimultaneousGestures(longPressGesture, panGesture);
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2],
      [COLORS.NAVY, COLORS.PURPLE, COLORS.KINDA_BLUE]
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      backgroundColor,
    };
  });

  return (
    <View style={styles.centerView}>
      <View>
        <GestureDetector gesture={gestures}>
          <Animated.View style={[styles.box, animatedStyle]} />
        </GestureDetector>
      </View>
      <Text style={styles.instructions}>
        The ball has simultanous pan and longPress gestures. Upon update pan
        changes minDistanceof longPress, such that longPress will fail if is
        moved horizontally.
      </Text>
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
    borderRadius: 60,
    marginBottom: 100,
  },
  instructions: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
