import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
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

  const panGesture = usePanGesture({
    onBegin: () => {
      colorProgress.value = withTiming(1, { duration: 150 });
    },
    onUpdate: (event) => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
    },
    onFinalize: () => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
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
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      backgroundColor,
    };
  });

  return (
    <View style={styles.centerView}>
      <GestureDetector gesture={panGesture}>
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
