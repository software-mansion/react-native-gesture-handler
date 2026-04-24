import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import React, { useRef } from 'react';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { commonStyles, Feedback, FeedbackHandle } from '../../../common';

const BOX_SIZE = 270;

const clampColor = (v: number) => Math.min(255, Math.max(0, v));

export default function TwoFingerPan() {
  const r = useSharedValue(128);
  const b = useSharedValue(128);
  const feedbackRef = useRef<FeedbackHandle>(null);

  const pan = usePanGesture({
    onUpdate: (event) => {
      'worklet';
      r.value = clampColor(r.value - event.changeY);
      b.value = clampColor(b.value + event.changeX);
    },
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Pan Activated');
    },
    runOnJS: true,
    enableTrackpadTwoFingerGesture: true,
  });

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = `rgb(${r.value}, 128, ${b.value})`;

    return {
      backgroundColor,
    };
  });

  return (
    <View style={commonStyles.centerView} collapsable={false}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.box, animatedStyles]} />
      </GestureDetector>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: BOX_SIZE / 2,
  },
});
