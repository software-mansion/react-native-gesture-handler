// eslint-disable-next-line import-x/extensions
import Hand from '@site/static/img/hand-one.svg';
// eslint-disable-next-line import-x/extensions
import Arrows from '@site/static/img/two-arrows.svg';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Directions,
  GestureDetector,
  GestureHandlerRootView,
  useFlingGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { isInsideCircle, RADIUS, useStylesForExample } from '../utils';
import stylesWeb from './styles.module.css';

export default function FlingExample() {
  const colorModeStyles = useStylesForExample();
  const [showHand, setShowHand] = useState(true);
  const startPositionX = useSharedValue(0);
  const endPositionX = useSharedValue(0);
  const startPositionY = useSharedValue(0);
  const endPositionY = useSharedValue(0);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  const config = { duration: 100 };

  const flingGesture = useFlingGesture({
    direction:
      Directions.UP | Directions.DOWN | Directions.LEFT | Directions.RIGHT,
    onBegin: (e) => {
      setShowHand(false);
      startPositionX.value = e.x;
      startPositionY.value = e.y;
    },
    onDeactivate: (e) => {
      endPositionX.value = e.x;
      endPositionY.value = e.y;
    },
    onActivate: (e) => {
      endPositionX.value = e.x;
      endPositionY.value = e.y;

      const valueX = Math.abs(startPositionX.value - endPositionX.value);
      const valueY = Math.abs(startPositionY.value - endPositionY.value);

      positionX.value =
        startPositionX.value < endPositionX.value
          ? positionX.value + e.x < RADIUS
            ? withTiming(positionX.value + valueX, config)
            : RADIUS
          : positionX.value - e.x > -RADIUS
            ? withTiming(positionX.value - valueX, config)
            : -RADIUS;
      positionY.value =
        startPositionY.value < endPositionY.value
          ? positionY.value + valueY < RADIUS
            ? withTiming(positionY.value + valueY, config)
            : RADIUS
          : positionY.value - valueY > -RADIUS
            ? withTiming(positionY.value - valueY, config)
            : -RADIUS;
    },
    onFinalize: () => {
      setShowHand(true);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          isInsideCircle(positionX.value, positionY.value) && positionX.value,
      },
      {
        translateY:
          isInsideCircle(positionX.value, positionY.value) && positionY.value,
      },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={flingGesture}>
        <>
          <Animated.View
            style={[styles.circle, animatedStyle, colorModeStyles.circle]}>
            <div className={stylesWeb.flingClone} />
            {showHand && (
              <div>
                <Arrows className={stylesWeb.arrowsFling} />
                <Hand className={stylesWeb.handFling} />
              </div>
            )}
          </Animated.View>
        </>
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
