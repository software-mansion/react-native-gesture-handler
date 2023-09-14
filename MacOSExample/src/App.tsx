import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import Draggable from './basic/draggable3';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Draggable />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
