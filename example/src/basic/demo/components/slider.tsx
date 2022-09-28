import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function Slider(props) {
  const [left, setLeft] = useState(-5);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(true)
    .onChange((e) => {
      setLeft(e.x - 5);
      props.onChange(e.x);
    })
    .onEnd((e) => {
      setLeft(e.x - 5);
      props.onChange(e.x);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <LinearGradient
        colors={['rgba(0,0,0,1)', props.color]}
        style={styles.slider}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>
        <View style={[styles.pointer, { left: left }]} />
      </LinearGradient>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '30vw',
    height: '5vh',
    borderRadius: 15,
    margin: 7,
    borderWidth: 2,
    display: 'flex',
    justifyContent: 'space-around',
  },

  pointer: {
    width: '2vw',
    height: '6vh',
    backgroundColor: 'lightgrey',
    borderRadius: 3,
    borderWidth: 2,
  },
});
