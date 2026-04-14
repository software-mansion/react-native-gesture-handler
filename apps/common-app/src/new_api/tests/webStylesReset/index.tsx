import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  Pressable,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

const Colors = {
  enabled: COLORS.GREEN,
  disabled: COLORS.RED,
};

const AnimationDuration = 250;

export default function WebStylesResetExample() {
  const [enabled, setEnabled] = useState(true);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const feedbackRef = useRef<FeedbackHandle>(null);

  const colorProgress = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [Colors.enabled, Colors.disabled]
    );

    return { backgroundColor };
  });

  const panGesture = usePanGesture({
    enabled: enabled,
    onUpdate: (e) => {
      'worklet';
      setX(e.x);
      setY(e.y);
    },
    onActivate: (e) => {
      'worklet';
      feedbackRef.current?.showMessage(`Pan started at: ${e.x.toFixed(2)}`);
    },
  });

  return (
    <View
      style={[commonStyles.centerView, { backgroundColor: COLORS.offWhite }]}>
      <GestureDetector gesture={panGesture} enableContextMenu={false}>
        <Animated.View
          style={[styles.box, styles.centerContent, animatedStyles]}>
          <Text style={{ fontSize: 32, color: 'white' }}> Lorem Ipsum </Text>
        </Animated.View>
      </GestureDetector>

      <Pressable
        style={[styles.button, styles.centerContent]}
        onPress={() => {
          const newState = !enabled;
          setEnabled(newState);
          feedbackRef.current?.showMessage(
            newState ? 'Gesture Enabled' : 'Gesture Disabled'
          );

          colorProgress.value = withTiming(newState ? 0 : 1, {
            duration: AnimationDuration,
          });
        }}>
        <Text style={{ fontSize: 16, color: 'white' }}>
          {enabled ? 'Disable' : 'Enable'}
        </Text>
      </Pressable>

      <Text style={{ fontSize: 16, color: COLORS.NAVY }}>
        x: {x.toFixed(2)}, y: {y.toFixed(2)}
      </Text>

      <Feedback ref={feedbackRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 250,
    height: 45,
    backgroundColor: COLORS.PURPLE,
    borderRadius: 10,
    margin: 25,
  },
  box: {
    width: 250,
    height: 250,
    borderRadius: 25,
  },
});
