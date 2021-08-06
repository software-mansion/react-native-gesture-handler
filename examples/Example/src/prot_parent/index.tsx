import React, { Component } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Animated, Text } from 'react-native';
import { USE_NATIVE_DRIVER } from '../config';
import {
  TapGestureHandler,
  PanGestureHandler,
  GestureMonitor,
  useGesture,
  Pan,
  Tap,
  Pinch,
  Rotation,
  LongPress,
  Root,
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

function Box(props) {
  const gs = useGesture(
    new Tap({
      onEnd: (e, s) => {
        if (s) console.log(props.color + ' ' + getState(e.nativeEvent.state));
      },
    })
  );
  return (
    <GestureMonitor gesture={gs}>
      <View
        style={[
          styles.box,
          { backgroundColor: props.color },
          props.overlap ? styles.overlap : {},
          props.style,
        ]}>
        {props.children}
      </View>
    </GestureMonitor>
  );
}

export default function Example() {
  const gs = useGesture(
    new Pan({
      onUpdate: (e) => {
        console.log('pan');
      },
    })
  );

  return (
    <View style={styles.home}>
      <GestureMonitor gesture={gs}>
        <Box color="red">
          <Box color="green" overlap={true} />
        </Box>
      </GestureMonitor>
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
