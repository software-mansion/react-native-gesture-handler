import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

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
  const tapRed = Gesture.Tap().onEnd((_e, success) => {
    if (success) {
      console.log('red');
    }
  });

  const tapGreen = Gesture.Tap().onEnd((_e, success) => {
    if (success) {
      console.log('green');
    }
  });

  return (
    <View style={styles.home}>
      <GestureDetector gesture={tapRed}>
        <Box color="red" />
      </GestureDetector>
      <GestureDetector gesture={tapGreen}>
        <Box color="green" overlap />
      </GestureDetector>
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
