import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function Photo() {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const scale = useSharedValue(1);
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

  const rotationGesture = Gesture.Rotation().onChange((e) => {
    'worklet';
    rotation.value += e.rotationChange;
  });

  const scaleGesture = Gesture.Pinch().onChange((e) => {
    'worklet';
    scale.value *= e.scaleChange;
  });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onChange((e) => {
      'worklet';
      translationX.value += e.changeX;
      translationY.value += e.changeY;
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
    <GestureDetector gesture={gesture}>
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
