import React from 'react';
import { StyleSheet, View } from 'react-native';
import Swipeable from './Swipeable';

function ExampleSwipeable() {
  return <Swipeable />;
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
