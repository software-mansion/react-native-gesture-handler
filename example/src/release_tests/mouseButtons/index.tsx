import React from 'react';
import {
  Gesture,
  GestureDetector,
  MouseButton,
} from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

export default function Buttons() {
  const leftTap = Gesture.Tap()
    .mouseButton(MouseButton.LEFT)
    .onEnd(() => console.log('LEFT'));

  const rightTap = Gesture.Tap()
    .mouseButton(MouseButton.RIGHT)
    .onEnd(() => console.log('RIGHT'));

  const middleTap = Gesture.Tap()
    .mouseButton(MouseButton.MIDDLE)
    .onEnd(() => console.log('MIDDLE'));

  const leftRightTap = Gesture.Tap()
    .mouseButton(MouseButton.LEFT | MouseButton.RIGHT)
    .onEnd(() => console.log('LEFT | RIGHT'));

  const allTap = Gesture.Tap()
    .mouseButton(MouseButton.LEFT | MouseButton.MIDDLE | MouseButton.RIGHT)
    .onEnd(() => console.log('LEFT | MIDDLE | RIGHT'));

  return (
    <View style={[{ flex: 1 }, styles.center]}>
      <View style={[{ height: 300 }, styles.center]}>
        <View style={{ flexDirection: 'row' }}>
          <GestureDetector gesture={leftTap}>
            <View style={styles.boxLeft} />
          </GestureDetector>
          <GestureDetector gesture={middleTap}>
            <View style={styles.boxMiddle} />
          </GestureDetector>
          <GestureDetector gesture={rightTap}>
            <View style={styles.boxRight} />
          </GestureDetector>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <GestureDetector gesture={leftRightTap}>
            <View style={styles.boxLeftRight} />
          </GestureDetector>
          <GestureDetector gesture={allTap}>
            <View style={styles.boxAll} />
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  boxLeft: {
    width: 100,
    height: 100,
    backgroundColor: 'darkmagenta',
  },
  boxRight: {
    width: 100,
    height: 100,
    backgroundColor: 'darkblue',
  },
  boxMiddle: {
    width: 100,
    height: 100,
    backgroundColor: 'darkgreen',
  },
  boxLeftRight: {
    width: 100,
    height: 100,
    backgroundColor: 'crimson',
  },
  boxAll: {
    width: 100,
    height: 100,
    backgroundColor: 'plum',
  },
});
