import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  BaseButton,
  Gesture,
  GestureDetector,
  RawButton,
  RectButton,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

export default function EmptyExample() {
  const tapGesture = Gesture.Tap().onStart(() => console.log('X tap gesture'));
  const innerTapGesture = Gesture.Tap().onStart(() => console.log('$ pressed'));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View>
        <RawButton
          style={styles.button}
          onActivated={() => console.log('$ pressed')}>
          <Text>RawButton</Text>
        </RawButton>
        <BaseButton
          style={styles.button}
          onPress={() => console.log('$ pressed')}
          onLongPress={() => console.log('$ long pressed')}>
          <Text>BaseButton</Text>
        </BaseButton>
        <RectButton
          style={styles.button}
          onPress={() => console.log('$ pressed')}
          onLongPress={() => console.log('$ long pressed')}>
          <Text>RectButton</Text>
        </RectButton>
        <GestureDetector gesture={innerTapGesture}>
          <Animated.View style={[styles.button, styles.other]}>
            <Text>TapGesture</Text>
          </Animated.View>
        </GestureDetector>
        <TouchableOpacity
          style={[styles.button, styles.other]}
          onPress={() => console.log('$ pressed')}
          onLongPress={() => console.log('$ long pressed')}>
          <Text>Touchable</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    borderWidth: 1,
  },
  other: {
    backgroundColor: 'skyblue',
  },
});
