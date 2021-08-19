import React, { useEffect, useState } from 'react';
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

function Draggable() {
  const [counter, setCounter] = useState(1);

  useEffect(() => {
    setInterval(() => {
      setCounter((a) => a + 1);
    }, 1000);
  }, []);

  const pressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(pressed.value ? 1.2 : 1) },
      ],
      backgroundColor: pressed.value ? 'yellow' : 'blue',
    };
  });

  const gs = useAnimatedGesture(
    Gesture.pan()
      .setOnBegan((_e) => {
        'worklet';
        pressed.value = true;
      })
      .setOnUpdate((e) => {
        'worklet';
        offset.value = {
          x: e.translationX + start.value.x,
          y: e.translationY + start.value.y,
        };
      })
      .setOnEnd((_e, _success) => {
        'worklet';
        start.value = {
          x: offset.value.x,
          y: offset.value.y,
        };
        pressed.value = false;
      })
  );

  return (
    <Animated.View>
      <GestureMonitor gesture={gs}>
        <Element styles={animatedStyles} counter={counter} />
      </GestureMonitor>
    </Animated.View>
  );
}

function Element(props: { styles: unknown; counter: number }) {
  return (
    <Animated.View style={[styles.button, props.styles]}>
      <Text style={styles.text}>{props.counter}</Text>
    </Animated.View>
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
