import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import stylesWeb from './styles.module.css';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { RADIUS, getStylesForExample, isInsideCircle } from '../utils';

export default function PinchExample() {
  const colorModeStyles = getStylesForExample();
  const [isPanEnabled, setIsPanEnabled] = useState(true);
  const [showGestureCircle, setShowGestureCircle] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const scalePan = useSharedValue(1);
  const pointerX = useSharedValue(0);
  const pointerY = useSharedValue(0);
  const oppositePointerX = useSharedValue(0);
  const oppositePointerY = useSharedValue(0);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);

  useEffect(() => {
    const container = document.getElementById('container-5');
    if (container) {
      setCenterX(
        container.offsetLeft + container.offsetWidth / 2 - window.scrollX
      );
      setCenterY(
        container.offsetTop + container.offsetHeight / 2 - window.scrollY
      );
    }
  }, []);

  const pan = Gesture.Pan()
    .onChange((e) => {
      if (isPanEnabled) {
        pointerX.value = e.absoluteX;
        pointerY.value = e.absoluteY;

        if (isInsideCircle(pointerX.value, pointerY.value, centerX, centerY)) {
          dx.value = centerX - pointerX.value;
          dy.value = centerY - pointerY.value;
          if (pointerX.value < centerX) {
            oppositePointerX.value = centerX + dx.value;
          } else {
            oppositePointerX.value = centerX - Math.abs(dx.value);
          }
          if (pointerY.value < centerY) {
            oppositePointerY.value = centerY + dy.value;
          } else {
            oppositePointerY.value = centerY - Math.abs(dy.value);
          }

          const distance = Math.sqrt(dx.value * dx.value + dy.value * dy.value);
          const maxDistance = RADIUS;
          const minScale = 1;
          const maxScale = 3;

          const scaleRange = maxScale - minScale;
          const scaleFactor = Math.min(distance / maxDistance, 1);
          scalePan.value = minScale + scaleFactor * scaleRange;

          setShowGestureCircle(true);
        }
      }
    })
    .onEnd(() => {
      setShowGestureCircle(false);
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      setIsPanEnabled(false);
      setShowGestureCircle(false);
    })
    .onUpdate((e) => {
      scale.value =
        savedScale.value * e.scale < 3
          ? savedScale.value * e.scale > 1
            ? savedScale.value * e.scale
            : 1
          : 3;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isPanEnabled ? scalePan.value : scale.value }],
  }));

  const smallCircleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: dx.value,
      },
      {
        translateY: dy.value,
      },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
        <Animated.View
          style={[styles.circle, animatedStyle, colorModeStyles.circle]}
        />
      </GestureDetector>
      {showGestureCircle && (
        <Animated.View style={[styles.smallCircle, smallCircleStyle]} />
      )}
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
    width: 56,
    height: 56,
    cursor: 'pointer',
    borderRadius: 100,
  },
  smallCircle: {
    position: 'absolute',
    height: 30,
    width: 30,
    borderRadius: 100,
    zIndex: 15,
    backgroundColor: 'var(--swm-purple-light-transparent-80)',
  },
});
