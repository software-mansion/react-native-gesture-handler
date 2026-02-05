import React from 'react';
import { PressableStateCallbackType, StyleSheet, View } from 'react-native';
import TestingBase from './testingBase';

export function FunctionalStyleExample() {
  const functionalStyle = (state: PressableStateCallbackType) => {
    if (state.pressed) {
      return {
        width: 100,
        height: 100,
        backgroundColor: 'red',
      };
    } else {
      return {
        width: 100,
        height: 100,
        backgroundColor: 'mediumpurple',
      };
    }
  };
  return (
    <View style={styles.container}>
      <TestingBase style={functionalStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    padding: 20,
  },
});
