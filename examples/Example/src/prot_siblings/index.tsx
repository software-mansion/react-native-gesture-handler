import React, { Component } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  event,
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

function Box(props) {
  const [s, setS] = useState(0);
  // const gs = useGesture(
  //   new Tap({
  //     onUpdate: (e) => {
  //       console.log(
  //         props.color + ' ' + getState(e.nativeEvent.state) + ' ' + s
  //       );

  //       if (e.nativeEvent.state == 4) setS(s + 1);
  //     },
  //   })
  // );

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: props.color },
        props.overlap ? styles.overlap : {},
        props.style,
      ]}></View>
  );
}

export default function Example() {
  const tap = new Tap({
    onEnd: (e, s) => {
      if (s) console.log('tap');
    },
  });

  const gs = useGesture(tap);

  return (
    <View
      style={styles.home}
      onGestureHandlerStateChange={(e) => {
        console.log('view');
      }}>
      <Wrap
        onGestureHandlerStateChange={(e) => {
          console.log('wrapper');
        }}>
        <GestureMonitor
          gesture={gs}
          onGestureHandlerStateChange={(e) => {
            console.log('monitor');
          }}>
          <View style={[styles.box, { backgroundColor: 'red' }]} />
        </GestureMonitor>
      </Wrap>
      <Box color="green" overlap={true} />
    </View>
  );
}

function Wrap(props) {
  return (
    <View
      onGestureHandlerStateChange={(e) => {
        console.log('wrapper view');
      }}>
      {props.children}
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
  box: {
    width: 150,
    height: 150,
  },
  overlap: {
    position: 'absolute',
    left: 75,
    top: 75,
  },
});
