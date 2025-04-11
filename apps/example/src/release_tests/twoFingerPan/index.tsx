import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const BOX_SIZE = 270;

const clampColor = (v: number) => Math.min(255, Math.max(0, v));

export default function TwoFingerPan() {
  const r = useSharedValue(128);
  const b = useSharedValue(128);

  const pan = Gesture.Pan()
    .onChange((event) => {
      r.value = clampColor(r.value - event.changeY);
      b.value = clampColor(b.value + event.changeX);
    })
    .runOnJS(true)
    .enableTrackpadTwoFingerGesture(true);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = `rgb(${r.value}, 128, ${b.value})`;

    return {
      backgroundColor,
    };
  });

  return (
    <View style={styles.container} collapsable={false}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.box, animatedStyles]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: BOX_SIZE / 2,
  },
});
