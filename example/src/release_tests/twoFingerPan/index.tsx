import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const BOX_SIZE = 270;

export default function TwoFingerPan() {
  const r = useSharedValue(128);
  const b = useSharedValue(128);

  const clampColor = (sv: SharedValue<number>) =>
    sv.value < 0 ? 0 : sv.value > 255 ? 255 : sv.value;

  const pan = Gesture.Pan()
    .onChange((event) => {
      r.value -= event.changeY;
      b.value += event.changeX;

      r.value = clampColor(r);
      b.value = clampColor(b);

      console.table({ red: r.value, blue: b.value });
    })
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
