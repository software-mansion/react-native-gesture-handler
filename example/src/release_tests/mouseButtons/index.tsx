import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureType,
  MouseButton,
  Directions,
  ScrollView,
} from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';

type TestProps = {
  name: string;
  gestureHandlers: GestureType[];
};

function Test({ name, gestureHandlers }: TestProps) {
  return (
    <View style={[{ height: 300 }, styles.center]}>
      <Text> {name} </Text>
      <View style={{ flexDirection: 'row' }}>
        <GestureDetector gesture={gestureHandlers[0]}>
          <View style={styles.boxLeft} />
        </GestureDetector>
        <GestureDetector gesture={gestureHandlers[1]}>
          <View style={styles.boxMiddle} />
        </GestureDetector>
        <GestureDetector gesture={gestureHandlers[2]}>
          <View style={styles.boxRight} />
        </GestureDetector>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <GestureDetector gesture={gestureHandlers[3]}>
          <View style={styles.boxLeftRight} />
        </GestureDetector>
        <GestureDetector gesture={gestureHandlers[4]}>
          <View style={styles.boxAll} />
        </GestureDetector>
      </View>
    </View>
  );
}

function TapTests() {
  const leftTap = Gesture.Tap()
    .mouseButton(MouseButton.LEFT)
    .onEnd(() => console.log('Tap with left'));

  const middleTap = Gesture.Tap()
    .mouseButton(MouseButton.MIDDLE)
    .onEnd(() => console.log('Tap with middle'));

  const rightTap = Gesture.Tap()
    .mouseButton(MouseButton.RIGHT)
    .onEnd(() => console.log('Tap with right'));

  const leftRightTap = Gesture.Tap()
    .mouseButton(MouseButton.LEFT | MouseButton.RIGHT)
    .onEnd(() => console.log('Tap with left | right'));

  const allTap = Gesture.Tap()
    .mouseButton(MouseButton.ALL)
    .onEnd(() => console.log('Tap with any button'));

  const gestureHandlers = [leftTap, middleTap, rightTap, leftRightTap, allTap];

  return <Test name={'Tap'} gestureHandlers={gestureHandlers} />;
}

function PanTests() {
  const leftPan = Gesture.Pan()
    .mouseButton(MouseButton.LEFT)
    .onChange(() => console.log('Panning with left'));

  const middlePan = Gesture.Pan()
    .mouseButton(MouseButton.MIDDLE)
    .onChange(() => console.log('Panning with middle'));

  const rightPan = Gesture.Pan()
    .mouseButton(MouseButton.RIGHT)
    .onChange(() => console.log('Panning with right'));

  const leftRightPan = Gesture.Pan()
    .mouseButton(MouseButton.LEFT | MouseButton.RIGHT)
    .onChange(() => console.log('Panning with left | right'));

  const allPan = Gesture.Pan()
    .mouseButton(MouseButton.ALL)
    .onChange(() => console.log('Panning with any button'));

  const gestureHandlers = [leftPan, middlePan, rightPan, leftRightPan, allPan];

  return <Test name={'Pan'} gestureHandlers={gestureHandlers} />;
}

function LongPressTests() {
  const leftLongPress = Gesture.LongPress()
    .mouseButton(MouseButton.LEFT)
    .onStart(() => console.log('LongPress with left'));

  const middleLongPress = Gesture.LongPress()
    .mouseButton(MouseButton.MIDDLE)
    .onStart(() => console.log('LongPress with middle'));

  const rightLongPress = Gesture.LongPress()
    .mouseButton(MouseButton.RIGHT)
    .onStart(() => console.log('LongPress with right'));

  const leftRightLongPress = Gesture.LongPress()
    .mouseButton(MouseButton.LEFT | MouseButton.RIGHT)
    .onStart(() => console.log('LongPress with left | right'));

  const allLongPress = Gesture.LongPress()
    .mouseButton(MouseButton.ALL)
    .onStart(() => console.log('LongPress with any button'));

  const gestureHandlers = [
    leftLongPress,
    middleLongPress,
    rightLongPress,
    leftRightLongPress,
    allLongPress,
  ];

  return <Test name={'LongPress'} gestureHandlers={gestureHandlers} />;
}

function FlingTests() {
  const leftFling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .mouseButton(MouseButton.LEFT)
    .onStart(() => console.log('Fling with left'));

  const middleFling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .mouseButton(MouseButton.MIDDLE)
    .onStart(() => console.log('Fling with middle'));

  const rightFling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .mouseButton(MouseButton.RIGHT)
    .onStart(() => console.log('Fling with right'));

  const leftRightFling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .mouseButton(MouseButton.LEFT | MouseButton.RIGHT)
    .onStart(() => console.log('Fling with left | right'));

  const allFling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .mouseButton(MouseButton.ALL)
    .onStart(() => console.log('Fling with any button'));

  const gestureHandlers = [
    leftFling,
    middleFling,
    rightFling,
    leftRightFling,
    allFling,
  ];

  return <Test name={'Fling'} gestureHandlers={gestureHandlers} />;
}

export default function Buttons() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <TapTests />
      <PanTests />
      <LongPressTests />
      <FlingTests />
    </ScrollView>
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
