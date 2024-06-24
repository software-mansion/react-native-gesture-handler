import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import TestingBase from './testingBase';

export function RippleExample() {
  const buttonOpacity =
    Platform.OS === 'android' ? { opacity: 1 } : { opacity: 0.6 };

  return (
    <View style={styles.container}>
      <TestingBase
        style={[styles.pressable, buttonOpacity]}
        android_ripple={{
          color: 'green',
          borderless: false,
          foreground: false,
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
    backgroundColor: 'mediumpurple',
  },
});
