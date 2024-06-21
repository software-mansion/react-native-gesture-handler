import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestingBase from './testingBase';

export function RippleExample() {
  return (
    <View style={styles.container}>
      <TestingBase
        style={styles.pressable}
        android_ripple={{
          color: 'red',
          borderless: true,
          radius: 50,
          foreground: true,
        }}
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
    width: 100,
    height: 100,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#97d9',
  },
});
