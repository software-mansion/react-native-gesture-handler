import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  Pressable,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Colors = {
  enabled: '#32a852',
  disabled: '#b02525',
};

const AnimationDuration = 250;

export default function WebStylesResetExample() {
  const [enabled, setEnabled] = useState(true);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const colorProgress = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [Colors.enabled, Colors.disabled]
    );

    return { backgroundColor };
  });

  const g = Gesture.Pan()
    .onUpdate((e) => {
      setX(e.x);
      setY(e.y);
    })
    .enabled(enabled);

  return (
    <View style={[styles.container, styles.centered]}>
      <GestureDetector gesture={g} enableContextMenu={false}>
        <Animated.View style={[styles.box, styles.centered, animatedStyles]}>
          <Text style={{ fontSize: 32 }}> Lorem Ipsum </Text>
        </Animated.View>
      </GestureDetector>

      <Pressable
        style={[styles.button, styles.centered]}
        onPress={() => {
          setEnabled((prev) => !prev);

          colorProgress.value = withTiming(enabled ? 1 : 0, {
            duration: AnimationDuration,
          });
        }}>
        <Text style={{ fontSize: 16 }}>{enabled ? 'Disable' : 'Enable'}</Text>
      </Pressable>

      <Text style={{ fontSize: 16 }}>
        {' '}
        x: {x}, y: {y}{' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },

  button: {
    width: 250,
    height: 35,
    backgroundColor: 'plum',
    borderRadius: 10,
    margin: 25,
  },

  box: {
    width: 250,
    height: 250,
    borderRadius: 25,
  },
});
