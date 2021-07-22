import React, { Component } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
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
} from 'react-native-gesture-handler';

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

function Draggable() {
  let x = 0,
    y = 0;

  const gs = useGesture(
    new Sequence([
      new LongPress({
        onUpdate: (e) => {
          if (e.nativeEvent.state == 1) {
            Animated.timing(scale, { toValue: 1, duration: 500 }).start();
          } else if (e.nativeEvent.state == 2) {
            Animated.timing(scale, { toValue: 1.2, duration: 500 }).start();

            x = translationX._value;
            y = translationY._value;
          }
        },
      }),
      new Pan({
        onUpdate: (e) => {
          translationX.setValue(x + e.nativeEvent.translationX);
          translationY.setValue(y + e.nativeEvent.translationY);

          if (e.nativeEvent.state == 5) {
            Animated.timing(scale, { toValue: 1, duration: 500 }).start();
          }
        },
      }),
    ])
  );

  const translationX = useRef(new Animated.Value(0)).current;
  const translationY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <GestureMonitor gesture={gs}>
      <Animated.View
        style={[
          styles.button,
          {
            transform: [
              { translateX: translationX },
              { translateY: translationY },
              { scale: scale },
            ],
          },
        ]}
      />
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
    width: 100,
    height: 100,
    backgroundColor: 'green',
    alignSelf: 'center',
  },
});
