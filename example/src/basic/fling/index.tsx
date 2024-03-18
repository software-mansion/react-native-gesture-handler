import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LoremIpsum } from '../../common';

function Fling() {
  const position = useSharedValue(0);
  const beginPosition = useSharedValue(0);

  const flingGesture = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .onBegin((e) => {
      beginPosition.value = e.x;
    })
    .onStart((e) => {
      const offset = (e.x - beginPosition.value) * 2;
      position.value = withTiming(position.value + offset, {
        duration: 300,
        easing: Easing.bounce,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <GestureDetector gesture={flingGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

export default class Example extends Component {
  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <LoremIpsum words={40} />
        <Fling />
        <LoremIpsum />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    marginBottom: 30,
  },
});
