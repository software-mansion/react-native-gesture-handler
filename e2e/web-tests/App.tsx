import React from 'react';
import { StyleSheet, View } from 'react-native';
import { enableExperimentalWebImplementation } from 'react-native-gesture-handler';
import { DoubleTapTest } from './components/DoubleTapTest';
import { PanTest } from './components/PanTest';
import { TapTest } from './components/TapTest';
import { LongPressTest } from './components/LongPressTest';

enableExperimentalWebImplementation();

export default function App() {
  return (
    <View style={styles.container}>
      <TapTest />
      <PanTest />
      <DoubleTapTest />
      <LongPressTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});
