import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Direction } from '../../../../../src/web/constants';
import { getRandomColor, IMAGES, IMG_SIZE, LOGO_SIZE, WIDTH } from '../utils';

export default function Character() {
  // Background color
  const [currentColor, setBgColor] = useState('white');
  const [lastColor, setLastColor] = useState('white');
  const [progress, setProgress] = useState(0);

  // Image
  const [currentImage, setCurrentImage] = useState(0);

  const progressSharedValue = useDerivedValue(() => {
    return withTiming(progress, { duration: 500 });
  });

  // Fling
  const leftFlingGesture = Gesture.Fling()
    .direction(Direction.LEFT)
    .onEnd((e) => {
      const index = currentImage === 0 ? IMAGES.length - 1 : currentImage - 1;

      setCurrentImage(index);
    });

  const rightFlingGesture = Gesture.Fling()
    .direction(Direction.RIGHT)
    .onEnd((e) => {
      const index = (currentImage + 1) % IMAGES.length;
      setCurrentImage(index);
    });

  // LongPress
  const longGesture = Gesture.LongPress().onStart((e) => {
    const color = getRandomColor();

    setLastColor(currentColor);
    setBgColor(color);
    setProgress(progress + 1);
  });

  // Tap
  const spring = useSharedValue(0);
  const tapGesture = Gesture.Tap().onStart((e) => {
    spring.value = withSequence(
      withTiming(150, { duration: 200 }),
      withTiming(0, { duration: 200 })
    );
  });

  // Pinch
  const scale = useSharedValue(1);
  const pinchGesture = Gesture.Pinch().onChange((e) => {
    'worklet';
    scale.value *= e.scaleChange;
  });

  // Rotation
  const rotation = useSharedValue(0);
  const rotationGesture = Gesture.Rotation().onChange((e) => {
    'worklet';
    rotation.value += e.rotationChange;
  });

  const gesture = Gesture.Simultaneous(
    pinchGesture,
    rotationGesture,
    longGesture,
    Gesture.Exclusive(leftFlingGesture, rightFlingGesture, tapGesture)
  );

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progressSharedValue.value,
      [progress - 1, progress],
      [lastColor, currentColor]
    );
    return {
      backgroundColor: backgroundColor,
      transform: [
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
        { translateY: -spring.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <Image style={styles.img} source={IMAGES[currentImage]} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,

    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',

    shadowColor: 'white',
    shadowOpacity: 1,
    shadowRadius: 25,
  },

  img: {
    width: IMG_SIZE,
    height: IMG_SIZE,
  },
});
