import React from 'react';
import { View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const COLORS = ['#b58df1', '#f1b58d', '#8df1b5', '#8d8df1', '#f18d8d'];

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
  },
});
