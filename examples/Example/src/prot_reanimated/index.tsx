import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GestureMonitor, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAnimatedGesture } from '../useAnimatedGesture';
import { useRef } from 'react';

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

  const ref = useRef();

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
      .setRef(ref)
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
      <Text>{counter}</Text>
      <GestureMonitor gesture={gs}>
        <Element styles={animatedStyles} />
      </GestureMonitor>
    </Animated.View>
  );
}

function Element(props) {
  return <Animated.View style={[styles.button, props.styles]} />;
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
  },
});
