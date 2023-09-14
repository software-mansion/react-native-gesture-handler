import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import BottomSheet from './showcase/bottomSheet';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheet />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
