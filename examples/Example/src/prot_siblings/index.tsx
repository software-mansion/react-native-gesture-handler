import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureMonitor,
  useGesture,
  Gesture,
} from 'react-native-gesture-handler';
import { useState } from 'react';

function Box(props) {
  const [s, setS] = useState(0);

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
  const tap = Gesture.tap().setOnEnd((e, s) => {
    if (s) console.log('red');
  });

  const gs = useGesture(tap);
  const gs2 = useGesture(
    Gesture.tap().setOnEnd((e, s) => {
      if (s) console.log('green');
    })
  );

  return (
    <View style={styles.home}>
      <GestureMonitor gesture={gs}>
        <View style={[styles.box, { backgroundColor: 'red' }]} />
      </GestureMonitor>
      <GestureMonitor gesture={gs2}>
        <Box color="green" overlap={true} />
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
