import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  GestureMonitor,
  Gesture,
  useAnimatedGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

type StylesType = {
  transform: AtLeastOne<{
    translateX: number;
    translateY: number;
    scale: number;
  }>[];
  backgroundColor: string;
};

function Draggable() {
  const [counter, setCounter] = useState(1);
  const intervalHandle = useRef<number>(0);

  useEffect(() => {
    intervalHandle.current = setInterval(() => {
      setCounter((a) => a + 1);
    }, 1000);

    return () => {
      clearInterval(intervalHandle.current);
    };
  }, []);

  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  const animatedStyles: StylesType = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? 'yellow' : 'blue',
    };
  });

  const gesture = useAnimatedGesture(
    Gesture.pan()
      .setOnBegan(() => {
        'worklet';
        isPressed.value = true;
      })
      .setOnUpdate((e) => {
        'worklet';
        offset.value = {
          x: e.translationX + start.value.x,
          y: e.translationY + start.value.y,
        };
      })
      .setOnEnd(() => {
        'worklet';
        start.value = {
          x: offset.value.x,
          y: offset.value.y,
        };
        isPressed.value = false;
      })
  );

  return (
    <Animated.View>
      <GestureMonitor gesture={gesture}>
        <Box styles={animatedStyles} counter={counter} />
      </GestureMonitor>
    </Animated.View>
  );
}

function Box(props: { styles: StylesType; counter: number }) {
  return (
    <Animated.View style={[styles.button, props.styles]}>
      <Text style={styles.text}>{props.counter}</Text>
    </Animated.View>
  );
}

export default function Example() {
  return (
    <View style={styles.container}>
      <Draggable />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'red',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  text: {
    alignSelf: 'center',
    fontSize: 16,
  },
});
