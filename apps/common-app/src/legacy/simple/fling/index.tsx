import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimationDuration = 100;

const Colors = {
  Initial: '#0a2688',
  Active: '#6fcef5',
};

export default function FlingExample() {
  const isActive = useSharedValue(false);
  const colorProgress = useSharedValue(0);
  const color1 = useSharedValue(Colors.Initial);
  const color2 = useSharedValue(Colors.Active);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [color1.value, color2.value]
    );

    return {
      transform: [
        {
          scale: withTiming(isActive.value ? 1.2 : 1, {
            duration: AnimationDuration,
          }),
        },
      ],
      backgroundColor,
    };
  });

  const g = Gesture.Fling()
    .direction(Directions.LEFT | Directions.UP)
    .onBegin(() => {
      console.log('onBegin');
    })
    .onStart(() => {
      console.log('onStart');
      isActive.value = true;
      colorProgress.value = withTiming(1, {
        duration: AnimationDuration,
      });
    })
    .onEnd(() => console.log('onEnd'))
    .onFinalize((_, success) => {
      console.log('onFinalize', success);

      isActive.value = false;

      colorProgress.value = withTiming(0, {
        duration: AnimationDuration,
      });
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={g}>
        <Animated.View style={[styles.box, animatedStyles]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  box: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
});
