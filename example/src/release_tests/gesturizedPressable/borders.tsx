import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestingBase from './testingBase';

export function BordersExample() {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.square}>
          <Text>Normal view</Text>
        </View>
        <TestingBase style={styles.square} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
    height: 130,
    marginBottom: 40,
    flexDirection: 'row',
  },
  square: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 5,
    borderBottomColor: '#0f0',
    borderRightColor: '#f00',
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'dodgerblue',
  },
});
