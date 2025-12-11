import { COLORS, Feedback } from '../../../common';
import React, { RefObject, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  GestureDetector,
  HoverEffect,
  useHoverGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

function useColoredHover(
  color: string,
  feedbackRef: RefObject<{ showMessage: (msg: string) => void } | null>
) {
  const hovered = useSharedValue(false);

  const style = useAnimatedStyle(() => ({
    opacity: hovered.value ? 0.5 : 1,
  }));

  const gesture = useHoverGesture({
    onBegin: () => {
      'worklet';
      hovered.value = true;
      feedbackRef.current?.showMessage('Hover begin ' + color);
    },
    onActivate: () => {
      'worklet';
      console.log('hover start', color);
    },
    onDeactivate: (_, success) => {
      'worklet';
      console.log('hover end', color, 'failed', !success);
    },
    onFinalize: () => {
      'worklet';
      hovered.value = false;
      console.log('hover finalize', color);
    },
    hoverEffect: HoverEffect.LIFT,
  });

  return [gesture, style] as const;
}

export default function Example() {
  const feedbackRefUpper = useRef<{ showMessage: (msg: string) => void }>(null);
  const feedbackRefLower = useRef<{ showMessage: (msg: string) => void }>(null);

  const [hover1, style1] = useColoredHover('red', feedbackRefUpper);
  const [hover2, style2] = useColoredHover('green', feedbackRefUpper);
  const [hover3, style3] = useColoredHover('red', feedbackRefLower);
  const [hover4, style4] = useColoredHover('green', feedbackRefLower);
  const [hover5, style5] = useColoredHover('blue', feedbackRefLower);

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.title}>Parent & child</Text>
        <GestureDetector gesture={hover1}>
          <Animated.View style={[styles.parentBox, style1]}>
            <GestureDetector gesture={hover2}>
              <Animated.View style={[styles.childBox, style2]} />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
        <Feedback ref={feedbackRefUpper} />
        <View style={styles.spacer} />
      </View>

      <View style={styles.subcontainer}>
        <Text style={styles.title}>Absolute positioning</Text>
        <View style={styles.absoluteContainer}>
          <GestureDetector gesture={hover3}>
            <Animated.View style={[styles.absoluteRed, style3]} />
          </GestureDetector>

          <GestureDetector gesture={hover5}>
            <Animated.View style={[styles.absoluteNavy, style5]} />
          </GestureDetector>

          <GestureDetector gesture={hover4}>
            <Animated.View style={[styles.absoluteGreen, style4]} />
          </GestureDetector>
        </View>
        <Feedback ref={feedbackRefLower} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  subcontainer: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    marginVertical: 8,
  },
  spacer: {
    height: 50,
  },
  parentBox: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.RED,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childBox: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.GREEN,
    elevation: 8,
  },
  absoluteContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteRed: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.RED,
  },
  absoluteNavy: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.NAVY,
    position: 'absolute',
  },
  absoluteGreen: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.GREEN,
    position: 'absolute',
  },
});
