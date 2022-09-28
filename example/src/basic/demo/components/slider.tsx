import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  POINTER_HEIGHT,
  POINTER_WIDTH,
  SLIDER_HEIGHT,
  SLIDER_WIDTH,
} from '../utils';

interface SliderProps {
  color: string;
  onChange: (value: number) => void;
}

export default function Slider(props: SliderProps) {
  const [left, setLeft] = useState(-5);

  const scaleValue = (x: number) => {
    const factor = x / SLIDER_WIDTH;
    return 255 * factor;
  };

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(true)
    .onChange((e) => {
      setLeft(e.x - POINTER_WIDTH / 2);

      const value = scaleValue(e.x);
      props.onChange(value);
    })

    .onEnd((e) => {
      setLeft(e.x - POINTER_WIDTH / 2);

      const value = scaleValue(e.x);
      props.onChange(value);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <LinearGradient
        colors={['rgba(0,0,0,1)', props.color]}
        style={styles.slider}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>
        <View style={[styles.pointer, { left: left }]} />
      </LinearGradient>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: 15,
    margin: 7,
    borderWidth: 2,
    display: 'flex',
    justifyContent: 'space-around',
  },

  pointer: {
    width: POINTER_WIDTH,
    height: POINTER_HEIGHT,
    backgroundColor: 'lightgrey',
    borderRadius: 3,
    borderWidth: 2,
  },
});
