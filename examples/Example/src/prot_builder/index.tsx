import React, { Component } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { USE_NATIVE_DRIVER } from '../config';
import {
  TapGestureHandler,
  PanGestureHandler,
  LongPressGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
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
  Gesture,
} from 'react-native-gesture-handler';
import { useState } from 'react';
import { createRef } from 'react';
import { useEffect } from 'react';

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

export default function Example() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCounter((c) => c + 1);
    }, 1000);
  }, []);

  const tripleTap = useRef();
  const doubleTap = useRef();
  const longPress = useRef();

  let gesture = useGesture(
    new Gesture()
      .tap({
        ref: doubleTap,
        requireToFail: tripleTap,
        numberOfTaps: 2,
        onEnd: (event) => {
          console.log('double tap');
        },
      })
      .tap({
        requireToFail: doubleTap,
        onEnd: (event) => {
          console.log('single tap, counter: ' + (counter + 1));
          setCounter(counter + 1);
        },
      })
      .longPress({
        ref: longPress,
        minDuration: 700,
        onStart: (event) => {
          console.log('long press start');
        },
        onEnd: (event) => {
          console.log(
            'long pressed for: ' + event.nativeEvent.duration + ' ms'
          );
        },
      })
      .pan({
        after: longPress,
        onUpdate: (event) => {
          console.log(
            'pan, x: ' +
              event.nativeEvent.translationX +
              ', y: ' +
              event.nativeEvent.translationY
          );
        },
        onCanceled: (e) => {
          console.log('pan canceled');
        },
      })
  );

  let tripleTapGesture = useGesture(
    new Gesture().tap({
      ref: tripleTap,
      numberOfTaps: 3,
      onStart: (e) => {
        console.log('triple tap');
      },
    })
  );

  return (
    <GestureMonitor gesture={tripleTapGesture}>
      <View style={styles.home}>
        <GestureMonitor gesture={gesture}>
          <View style={[styles.button]}>
            <Text>{counter}</Text>
          </View>
        </GestureMonitor>
      </View>
    </GestureMonitor>
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
