import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Hand from '@site/static/img/hand-one.svg';
import stylesWeb from './styles.module.css';
import { RADIUS, useStylesForExample } from '../utils';

export default function LongPressExample() {
  const colorModeStyles = useStylesForExample();
  const [showHand, setShowHand] = useState(true);
  const pressed = useSharedValue(false);

  const longPress = Gesture.LongPress()
    .onStart(() => {
      pressed.value = true;
      setShowHand(false);
    })
    .onEnd(() => {
      pressed.value = false;
      setShowHand(true);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: pressed.value
      ? 'var(--swm-yellow-dark-80)'
      : 'var(--swm-purple-light-100)',
    transform: [{ scale: withTiming(pressed.value ? 1.8 : 1) }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={longPress}>
        <Animated.View
          style={[styles.circle, animatedStyles, colorModeStyles.circle]}>
          <div className={stylesWeb.longPressClone} />
          {showHand && <Hand className={stylesWeb.handLongPress} />}
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
    border: '8px solid var(--swm-purple-light-80)',
    backgroundColor: 'var(--swm-purple-light-100)',
    borderRadius: 100,
  },
});
