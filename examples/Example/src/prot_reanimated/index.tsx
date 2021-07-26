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
  call,
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

function useAnimatedGesture(g) {
  const callback = (e) => {
    for (const gs of g.current) {
      if (gs.handlerTag == e.handlerTag) {
        gs.onUpdate(e);
      }
    }
  };

  const handler = (e) => {
    'worklet';
    runOnJS(callback)(e);
  };

  return useEvent(
    handler,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    false
  );
}

function Draggable() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const gs = useGesture(
    new Simultaneous([
      new Pan({
        onUpdate: (e) => {
          if (e.state == 4) {
            offsetX.value = e.translationX + startX.value;
            offsetY.value = e.translationY + startY.value;
          } else if (e.state == 2) {
            startX.value = offsetX.value;
            startY.value = offsetY.value;
          }
        },
      }),
    ])
  );

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    };
  });
  const animatedHandler = useAnimatedGesture(gs);

  return (
    <GestureMonitor gesture={gs} animated={animatedHandler}>
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
