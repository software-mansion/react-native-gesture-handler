import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestingBase from './testingBase';

export function DelayHoverExample() {
  const hoverIn = () => {
    console.log('Hover in with delay registered');
  };

  const hoverOut = () => {
    console.log('Hover out with delay registered');
  };

  return (
    <View style={styles.container}>
      <TestingBase
        style={styles.pressable}
        onHoverIn={() => hoverIn()}
        onHoverOut={() => hoverOut()}
        delayHoverIn={500}
        delayHoverOut={500}
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
