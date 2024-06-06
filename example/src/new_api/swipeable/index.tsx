import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Swipeable from './Swipeable';

function ExampleSwipeable() {
  return (
    <Swipeable
      friction={2}
      leftThreshold={80}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}>
      <Text>Lorem Ipsum</Text>
    </Swipeable>
  );
}

export default function Example() {
  return (
    <View style={styles.home}>
      <ExampleSwipeable />
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'plum',
  },
});
