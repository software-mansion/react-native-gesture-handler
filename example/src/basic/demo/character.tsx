import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getRandomColor } from './utils';

export default function Character() {
  // Background color
  const [currentColor, setBgColor] = useState('white');
  const [lastColor, setLastColor] = useState('white');
  const [progress, setProgress] = useState(0);

  // Simley
  const [smile, setSmile] = useState('M 70 120 L 100 150 L 130 120');

  const progressSharedValue = useDerivedValue(() => {
    return withTiming(progress, { duration: 500 });
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

  // Fling
  const downFlingGesture = Gesture.Fling()
    .direction(Directions.DOWN)
    .onEnd((e) => {
      setSmile('M 70 120 L 100 150 L 130 120');
    });
  const upFlingGesture = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd((e) => {
      setSmile('M 70 150 L 100 120 L 130 150');
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
    Gesture.Exclusive(downFlingGesture, upFlingGesture, tapGesture)
  );

  const animatedStyle = useAnimatedStyle(() => {
    console.log(progressSharedValue.value);
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
      <Animated.View style={[styles.wrapper, styles.char, animatedStyle]}>
        <svg width="200" height="200">
          <path
            d={`M 40 75
              A 26 150 0 0 1 70 75
              M 130 75
              A 26 150 0 0 1 160 75
              ${smile}
            `}
            stroke="black"
            fill="transparent"
            strokeWidth="2"
          />
        </svg>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 100,
  },
  char: {
    shadowColor: 'white',
    shadowOpacity: 1,
    shadowRadius: 25,
  },
});
