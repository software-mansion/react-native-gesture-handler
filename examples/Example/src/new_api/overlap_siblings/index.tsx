import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureMonitor, Gesture } from 'react-native-gesture-handler';

function Box(props: { color: string; overlap?: boolean }) {
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: props.color },
        props.overlap ? styles.overlap : {},
      ]}
    />
  );
}

export default function Example() {
  const tapRed = Gesture.tap().setOnEnd((_e, success) => {
    if (success) {
      console.log('red');
    }
  });

  const tapGreen = Gesture.tap().setOnEnd((_e, success) => {
    if (success) {
      console.log('green');
    }
  });

  return (
    <View style={styles.home}>
      <GestureMonitor gesture={tapRed}>
        <Box color="red" />
      </GestureMonitor>
      <GestureMonitor gesture={tapGreen}>
        <Box color="green" overlap />
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
