import React from 'react';
import { View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const COLORS = ['#33488e', '#ffe04b', '#5bb9e0', '#fa7f7c', '#82cab2'];

export default function App() {
  const [color, setColor] = React.useState(COLORS[0]);

  const tap = Gesture.Tap().onEnd(() => {
    const nextColorIndex = (COLORS.indexOf(color) + 1) % COLORS.length;
    setColor(COLORS[nextColorIndex]);
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={tap}>
        <View style={{ ...styles.box, backgroundColor: color }}></View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 100,
    borderRadius: 20,
    cursor: 'pointer',
  },
});
