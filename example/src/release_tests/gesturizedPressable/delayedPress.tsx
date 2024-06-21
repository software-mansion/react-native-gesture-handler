import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestingBase from './testingBase';

export function DelayedPressExample() {
  const pressDelay = 300;
  const longPressDelay = 1000;

  const onPress = () => {
    console.log('Pressed with delay');
  };

  const onLongPress = () => {
    console.log('Long pressed with delay');
  };

  return (
    <View style={styles.container}>
      <TestingBase
        style={styles.pressable}
        delayLongPress={longPressDelay}
        unstable_pressDelay={pressDelay}
        onPress={onPress}
        onLongPress={onLongPress}
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
    backgroundColor: 'mediumpurple',
  },
});
