import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function App() {
  const innerTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: (_, success) => {
      if (success) {
        console.log('inner tap');
      }
    },
  });

  const outerTap = useTapGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('outer tap');
      }
    },
    requireToFail: innerTap,
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={outerTap}>
        <View style={styles.outer}>
          <GestureDetector gesture={innerTap}>
            <View style={styles.inner} />
          </GestureDetector>
        </View>
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
  outer: {
    width: 250,
    height: 250,
    backgroundColor: 'lightblue',
  },
  inner: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
