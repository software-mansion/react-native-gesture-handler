import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureMonitor, Gesture } from 'react-native-gesture-handler';

function Photo() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const scale = useSharedValue(1);
  const savedRotation = useSharedValue(0);
  const rotation = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  const gesture = Gesture.rotation()
    .setOnUpdate((e) => {
      'worklet';
      rotation.value = savedRotation.value + e.rotation;
    })
    .setOnEnd(() => {
      'worklet';
      savedRotation.value = rotation.value;
    })
    .simultaneousWith(
      Gesture.pinch()
        .setOnUpdate((e) => {
          'worklet';
          scale.value = savedScale.value * e.scale;
        })
        .setOnEnd(() => {
          'worklet';
          savedScale.value = scale.value;
        })
    )
    .simultaneousWith(
      Gesture.pan()
        .setAverageTouches(true)
        .setOnUpdate((e) => {
          'worklet';
          translationX.value = offsetX.value + e.translationX;
          translationY.value = offsetY.value + e.translationY;
        })
        .setOnEnd(() => {
          'worklet';
          offsetX.value = translationX.value;
          offsetY.value = translationY.value;
        })
    )
    .simultaneousWith(
      Gesture.tap()
        .setTapCount(2)
        .setOnEnd((_e, success) => {
          'worklet';
          if (success) {
            scale.value = scale.value * 1.25;
          }
        })
    );

  return (
    <GestureMonitor animatedGesture={gesture}>
      <Animated.View style={[styles.button, style]} />
    </GestureMonitor>
  );
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Photo />
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
