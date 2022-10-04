import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
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
import { getRandomColor, IMAGES, IMG_SIZE, LOGO_SIZE, HEIGHT } from '../utils';

export default function Logo() {
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
    .onEnd(() => {
      const index = currentImage === 0 ? IMAGES.length - 1 : currentImage - 1;

      setCurrentImage(index);
    });

  const rightFlingGesture = Gesture.Fling()
    .direction(Direction.RIGHT)
    .onEnd(() => {
      const index = (currentImage + 1) % IMAGES.length;
      setCurrentImage(index);
    });

  // LongPress
  const longGesture = Gesture.LongPress().onStart(() => {
    const color = getRandomColor();

    setLastColor(currentColor);
    setBgColor(color);
    setProgress(progress + 1);
  });

  // Tap
  const spring = useSharedValue(0);
  const tapGesture = Gesture.Tap().onStart(() => {
    spring.value = withSequence(
      withTiming(HEIGHT / 7, { duration: 200 }),
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
        <Animated.Image style={styles.img} source={IMAGES[currentImage]} />
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
