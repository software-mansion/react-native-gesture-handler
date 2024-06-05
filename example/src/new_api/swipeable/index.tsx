import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Swipeable from './Swipeable';

function ExampleSwipeable() {

    return <Swipeable/>
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
    button: {
      width: 200,
      height: 200,
      backgroundColor: 'green',
      alignSelf: 'center',
    },
  });
  