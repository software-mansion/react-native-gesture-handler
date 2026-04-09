import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

// @ts-ignore it's an image
import SIGNET from '../../../ListWithHeader/signet.png';

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
      <Animated.View style={[styles.container, style]}>
        <Image source={SIGNET} style={styles.image} resizeMode="contain" />
      </Animated.View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 240,
    height: 240,
    backgroundColor: '#eef0ff',
    padding: 16,
    elevation: 8,
    borderRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: 208,
    height: 208,
  },
});
