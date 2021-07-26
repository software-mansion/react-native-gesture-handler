import React, { Component } from 'react';
import { useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { USE_NATIVE_DRIVER } from '../config';
import {
  TapGestureHandler,
  PanGestureHandler,
  GestureMonitor,
  useGesture,
  Pan,
  Tap,
  Simultaneous,
  Pinch,
  Rotation,
  Exclusive,
  Sequence,
  LongPress,
  RotationGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  useEvent,
  runOnJS,
} from 'react-native-reanimated';

function getState(s: number) {
  switch (s) {
    case 0:
      return 'Undetermined';
    case 1:
      return 'Failed';
    case 2:
      return 'Began';
    case 3:
      return 'Cancelled';
    case 4:
      return 'Active';
    case 5:
      return 'End';
  }
  return s;
}

function useAnim(g, event) {
  const handler = (e) => {
    'worklet';
    runOnJS(g.onUpdate)(e);
  };

  return useEvent(handler, [event], false);
}

function Draggable() {
  const offset = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });
  const eventHandler = useAnim(
    {
      onUpdate: (event) => {
        console.log('rot: ' + JSON.stringify(event));
        //offset.value = event.translationX
      },
    },
    'onRotationEvent'
  );

  const eventHandler2 = useAnim(
    {
      onUpdate: (event) => {
        console.log('pinch: ' + JSON.stringify(event));
        //offset.value = event.translationX
      },
    },
    'onPinchEvent'
  );

  const gs = useGesture(
    new Simultaneous([
      new Rotation({ onUpdate: eventHandler }),
      new Pinch({ onUpdate: eventHandler2 }),
    ])
  );

  return (
    <GestureMonitor gesture={gs}>
      <Animated.View style={[styles.button, animatedStyles]} />
    </GestureMonitor>
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
    backgroundColor: 'plum',
  },
  button: {
    width: 200,
    height: 200,
    backgroundColor: 'green',
    alignSelf: 'flex-start',
  },
});
