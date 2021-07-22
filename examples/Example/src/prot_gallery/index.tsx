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
import { useState } from 'react';

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

function Photo() {
  let x = 0,
    y = 0,
    s = 1;

  const translationX = useRef(new Animated.Value(0)).current;
  const translationY = useRef(new Animated.Value(0)).current;
  const [scale, setScale] = useState(1);
  const rotation = useRef(new Animated.Value(0)).current;

  const rotateData = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const gs = useGesture(
    new Simultaneous([
      new Tap({
        onUpdate: (e) => {
          if (e.nativeEvent.state == 2) {
            x = translationX._value;
            y = translationY._value;
          }
        },
      }),
      new Pan({
        onUpdate: (e) => {
          translationX.setValue(x + e.nativeEvent.translationX);
          translationY.setValue(y + e.nativeEvent.translationY);
        },
        avgTouches: true,
      }),
      new Tap({
        numberOfTaps: 2,
        onUpdate: (e) => {
          if (e.nativeEvent.state == 4) {
            setScale(scale + 0.25);
          }
        },
      }),
      new Rotation({
        onUpdate: (e) => {
          if (e.nativeEvent.state == 4) {
            rotation.setValue(e.nativeEvent.rotation / (Math.PI * 2));
          }
        },
      }),
      new Pinch({
        onUpdate: (e) => {
          if (e.nativeEvent.state == 4) {
            setScale(s * e.nativeEvent.scale);
          } else if (e.nativeEvent.state == 2) {
            s = scale;
          }
        },
      }),
    ])
  );

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
              { rotateZ: rotateData },
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
      <Photo />
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
    alignSelf: 'center',
  },
});
