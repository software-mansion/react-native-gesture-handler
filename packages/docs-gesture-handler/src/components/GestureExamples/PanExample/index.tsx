import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Hand from '@site/static/img/hand-one.svg';
import stylesWeb from './styles.module.css';
import { RADIUS, isInsideCircle, useStylesForExample } from '../utils';

export default function DecayBasicExample() {
  const colorModeStyles = useStylesForExample();
  const [showHand, setShowHand] = useState(true);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => setShowHand(false))
    .onChange((event) => {
      offsetX.value =
        Math.abs(offsetX.value) <= 100
          ? offsetX.value + event.changeX >= 100
            ? 100
            : offsetX.value + event.changeX <= -100
            ? -100
            : offsetX.value + event.changeX
          : offsetX.value;
      offsetY.value =
        Math.abs(offsetY.value) <= 100
          ? offsetY.value + event.changeY >= 100
            ? 100
            : offsetY.value + event.changeY <= -100
            ? -100
            : offsetY.value + event.changeY
          : offsetY.value;
    })
    .onEnd(() => setShowHand(true))
    .minDistance(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          isInsideCircle(offsetX.value, offsetY.value) &&
          clamp(offsetX.value, -100, 100),
      },
      {
        translateY:
          isInsideCircle(offsetX.value, offsetY.value) &&
          clamp(offsetY.value, -100, 100),
      },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.circle, animatedStyles, colorModeStyles.circle]}>
          <div className={stylesWeb.panClone} />
          {showHand && <Hand className={stylesWeb.handPan} />}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 2 * RADIUS,
    width: 2 * RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    height: 56,
    cursor: 'pointer',
    width: 56,
    borderRadius: 100,
  },
});
