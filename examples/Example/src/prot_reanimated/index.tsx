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
  const [a, sa] = useState(1);

  useEffect(() => {
    setInterval(() => {
      sa((a) => a + 1);
    }, 1000);
  }, []);

  const pressed = useSharedValue(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const ref = useRef();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: withSpring(pressed.value ? 1.2 : 1) },
      ],
      backgroundColor: pressed.value ? 'yellow' : 'blue',
    };
  });

  const gs = useAnimatedGesture(
    Gesture.pan()
      .setRef(ref)
      .setOnBegan((e) => {
        'worklet';
        pressed.value = true;
      })
      .setOnUpdate((e) => {
        'worklet';
        offsetX.value = e.translationX * 1.2 + startX.value;
        offsetY.value = e.translationY * 1.2 + startY.value;
      })
      .setOnEnd((e, success) => {
        'worklet';
        startX.value = offsetX.value;
        startY.value = offsetY.value;
        pressed.value = false;
      })
  );

  return (
    <Animated.View>
      <Text>{a}</Text>
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
