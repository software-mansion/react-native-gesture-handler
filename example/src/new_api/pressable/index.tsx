import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

export default function EmptyExample() {
  const pressIn = () => {
    console.log('Pressable pressed in');
  };

  const pressOut = () => {
    console.log('Pressable pressed in');
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.pressable}
        onPressIn={pressIn}
        onPressOut={pressOut}>
        <Text>Pressable!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  pressable: {
    backgroundColor: 'purple',
    width: 100,
    height: 100,
  },
});
