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
        <View style={styles.textWrapper}>
          <Text style={styles.text}>Pressable!</Text>
        </View>
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
    backgroundColor: 'mediumpurple',
    width: 120,
    height: 120,
    margin: 'auto',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F5FCFF',
  },
});
