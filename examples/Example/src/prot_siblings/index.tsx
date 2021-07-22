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

function Box(props) {
  const [s, setS] = useState(0);
  const gs = useGesture(
    new Rotation({
      onUpdate: (e) => {
        console.log(
          props.color + ' ' + getState(e.nativeEvent.state) + ' ' + s
        );

        if (e.nativeEvent.state == 4) setS(s + 1);
      },
    })
  );

  console.log('render');

  return (
    <GestureMonitor gesture={gs}>
      <View
        style={[
          styles.box,
          { backgroundColor: props.color },
          props.overlap ? styles.overlap : {},
          props.style,
        ]}></View>
    </GestureMonitor>
  );
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Box color="red" style={{ zIndex: 3 }} />
    </View>
    /*<View style={styles.home}>
        <Box color="red" style={{zIndex: 3}}/>
        <Box color="green" overlap={true}/>
    </View>*/
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
