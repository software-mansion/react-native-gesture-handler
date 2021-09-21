import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

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

  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      'worklet';
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      'worklet';
      savedRotation.value = rotation.value;
    });

  const scaleGesture = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      'worklet';
      translationX.value = offsetX.value + e.translationX;
      translationY.value = offsetY.value + e.translationY;
    })
    .onEnd(() => {
      'worklet';
      offsetX.value = translationX.value;
      offsetY.value = translationY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      'worklet';
      if (success) {
        scale.value *= 1.25;
      }
    });

  const gesture = Gesture.Simultaneous(
    rotationGesture,
    scaleGesture,
    panGesture,
    doubleTapGesture
  );

  return (
    <GestureDetector animatedGesture={gesture}>
      <Animated.View style={[styles.button, style]} />
    </GestureDetector>
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
