import { StyleSheet, View } from 'react-native';

import React from 'react';
import { GestureDetector } from '../../../../src/handlers/gestures/GestureDetector';
import { Gesture } from 'react-native-gesture-handler';

declare const _WORKLET: boolean; // from react-native-reanimated

export default function ManualGestureExample() {
  const gesture1 = Gesture.Manual()
    .onTouchesDown((e) => {
      console.log(_WORKLET, 'onTouchesDown', e);
    })
    .onTouchesMove((e) => {
      console.log(_WORKLET, 'onTouchesMove', e);
    })
    .onTouchesUp((e) => {
      console.log(_WORKLET, 'onTouchesUp', e);
    });

  const gesture2 = Gesture.Manual()
    .onTouchesDown((e) => {
      'worklet';
      console.log(_WORKLET, 'onTouchesDown', e);
    })
    .onTouchesMove((e) => {
      'worklet';
      console.log(_WORKLET, 'onTouchesMove', e);
    })
    .onTouchesUp((e) => {
      'worklet';
      console.log(_WORKLET, 'onTouchesUp', e);
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture1}>
        <View style={styles.box1} />
      </GestureDetector>
      <GestureDetector gesture={gesture2}>
        <View style={styles.box2} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box1: {
    width: 100,
    height: 100,
    marginVertical: 20,
    backgroundColor: 'violet',
  },
  box2: {
    width: 100,
    height: 100,
    marginVertical: 20,
    backgroundColor: 'navy',
  },
});
