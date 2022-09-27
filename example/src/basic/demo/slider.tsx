import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function Slider(props) {
  const panGesture = Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(true)
    .onChange((e) => {
      console.log(e.x);
      props.onChange(e.x);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <LinearGradient
        colors={['rgba(0,0,0,1)', props.color]}
        style={styles.background}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 255,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
  },
  background: {
    width: 255,
    height: 50,
    borderRadius: 15,
    margin: 5,
    borderWidth: 2,
  },
});
