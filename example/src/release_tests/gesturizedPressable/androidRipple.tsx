import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestingBase from './testingBase';

export function RippleExample() {
  const hitSlop = 40;

  return (
    <View style={styles.container}>
      <TestingBase
        style={styles.pressable}
        hitSlop={hitSlop}
        rippleColor="red"
        rippleRadius={20}
      />
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
  pressable: {
    backgroundColor: 'mediumpurple',
    width: 100,
    height: 100,
  },
});
