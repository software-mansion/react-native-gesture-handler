import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureMonitor, Gesture } from 'react-native-gesture-handler';
import { useAnimatedGesture } from '../useAnimatedGesture';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

function Draggable() {
  const translation = useSharedValue({ x: 0, y: 0 });

  const gs = useAnimatedGesture(
    Gesture.pan().setOnUpdate((e) => {
      'worklet';
      translation.value = { x: e.translationX, y: e.translationY };
    })
  );

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translation.value.x },
        { translateY: translation.value.y },
      ],
    };
  });

  return (
    <GestureMonitor gesture={gs}>
      <Animated.View style={[styles.button, animatedStyles]} />
    </GestureMonitor>
  );
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Draggable />
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'plum',
  },
  button: {
    width: 200,
    height: 200,
    backgroundColor: 'green',
    alignSelf: 'center',
  },
});
