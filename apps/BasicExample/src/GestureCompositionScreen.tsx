import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS } from './colors';

function RaceDemo() {
  const pan = Gesture.Pan()
    .onStart(() => console.log('pan onStart'))
    .onUpdate(() => console.log('pan onUpdate'))
    .onEnd(() => console.log('pan onEnd'));

  const longPress = Gesture.LongPress()
    .onStart(() => console.log('longPress onStart'))
    .onEnd(() => console.log('longPress onEnd'));

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>
        Gesture.Race(pan, longPress) - the first gesture that meets its
        activation criteria will activate
      </Text>
      <GestureDetector gesture={Gesture.Race(pan, longPress)}>
        <View
          style={[styles.largeBox, { backgroundColor: COLORS.KINDA_RED }]}
        />
      </GestureDetector>
    </View>
  );
}

function ExclusiveDemo() {
  const singleTap = Gesture.Tap().onStart(() => console.log('single tap!'));
  const doubleTap = Gesture.Tap()
    .onStart(() => console.log('double tap!'))
    .numberOfTaps(2);

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>
        Gesture.Exclusive(doubleTap, singleTap) - the second gesture will wait
        for the failure of the first one
      </Text>
      <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
        <View
          style={[styles.largeBox, { backgroundColor: COLORS.KINDA_GREEN }]}
        />
      </GestureDetector>
    </View>
  );
}

function SimultaneousDemo() {
  const pinch = Gesture.Pinch()
    .onStart(() => console.log('pinch onStart'))
    .onUpdate(() => console.log('pinch onUpdate'))
    .onEnd(() => console.log('pinch onEnd'));
  const rotation = Gesture.Rotation()
    .onStart(() => console.log('rotation onStart'))
    .onUpdate(() => console.log('rotation onUpdate'))
    .onEnd(() => console.log('rotation onEnd'));

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>
        Gesture.Simultaneous(pinch, rotation) - both gestures can activate and
        process touches at the same time
      </Text>
      <GestureDetector gesture={Gesture.Simultaneous(pinch, rotation)}>
        <View
          style={[styles.largerBox, { backgroundColor: COLORS.KINDA_BLUE }]}
        />
      </GestureDetector>
    </View>
  );
}

export default function ComponentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>
        Gesture Handler provides a simple API for using multiple gestures at
        once in different configurations.
      </Text>
      <RaceDemo />
      <ExclusiveDemo />
      <SimultaneousDemo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  text: {
    marginVertical: 3,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  demo: {
    marginVertical: 3,
    alignItems: 'center',
  },
  largeBox: {
    width: 100,
    height: 100,
  },
  largerBox: {
    width: 150,
    height: 150,
  },
});
