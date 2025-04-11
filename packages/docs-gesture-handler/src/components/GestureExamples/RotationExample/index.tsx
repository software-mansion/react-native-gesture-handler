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
import Hand from '@site/static/img/hand-two.svg';
import Arrow from '@site/static/img/arrow-circle-left.svg';
import { useColorMode } from '@docusaurus/theme-common';
import { RADIUS, isInsideCircle } from '../utils';

export default function RotationExample() {
  const colorModeStyles =
    useColorMode().colorMode === 'dark' ? darkStyles : lightStyles;
  const rotationVal = useSharedValue(0);
  const [isPanEnabled, setIsPanEnabled] = useState(true);
  const [showGestureCircle, setShowGestureCircle] = useState(false);
  const [showHand, setShowHand] = useState(true);
  const savedRotation = useSharedValue(1);
  const pointerX = useSharedValue(0);
  const pointerY = useSharedValue(0);
  const oppositePointerX = useSharedValue(0);
  const oppositePointerY = useSharedValue(0);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);

  useEffect(() => {
    const updateCenter = () => {
      const container = document.getElementById('container-2');
      if (container) {
        setCenterX(
          container.offsetLeft + container.offsetWidth / 2 - window.scrollX
        );
        setCenterY(
          container.offsetTop + container.offsetHeight / 2 - window.scrollY
        );
      }
    };

    updateCenter();

    window.addEventListener('scroll', updateCenter);

    return () => {
      window.removeEventListener('scroll', updateCenter);
    };
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => setShowHand(false))
    .onChange((e) => {
      if (isPanEnabled) {
        pointerX.value = e.absoluteX;
        pointerY.value = e.absoluteY;
        dx.value = centerX - pointerX.value;
        dy.value = centerY - pointerY.value;
        if (isInsideCircle(pointerX.value, pointerY.value, centerX, centerY)) {
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
          const vectorX = oppositePointerX.value - pointerX.value;
          const vectorY = oppositePointerY.value - pointerY.value;
          rotationVal.value = Math.atan2(vectorY, vectorX);

          setShowGestureCircle(true);
        }
      }
    })
    .onEnd(() => {
      setShowGestureCircle(false);
      setShowHand(true);
    });

  const rotation = Gesture.Rotation()
    .onStart(() => {
      setIsPanEnabled(false);
      setShowGestureCircle(false);
      setShowHand(false);
    })
    .onUpdate((e) => {
      rotationVal.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotationVal.value;
      setIsPanEnabled(true);
      setShowHand(true);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${(rotationVal.value * 180) / Math.PI}deg` },
      { rotateY: `${(rotationVal.value * 180) / Math.PI}deg` },
      { rotateX: `${(rotationVal.value * 180) / Math.PI}deg` },
    ],
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
    <GestureDetector gesture={Gesture.Simultaneous(pan, rotation)}>
      <GestureHandlerRootView style={styles.container}>
        <div className={stylesWeb.rotationClone} />
        {showHand && <Arrow className={stylesWeb.arrowRotation} />}
        <div className={stylesWeb.wrapper}>
          <Animated.View
            style={[styles.circle, animatedStyle, colorModeStyles.circle]}
          />
          <View
            style={[
              styles.circleStatic,
              animatedStyle,
              colorModeStyles.circleStatic,
            ]}
          />
        </div>
        {showHand && <Hand className={stylesWeb.handRotation} />}
        {showGestureCircle && (
          <Animated.View style={[styles.smallCircle, smallCircleStyle]} />
        )}
      </GestureHandlerRootView>
    </GestureDetector>
  );
}

const lightStyles = {
  circle: {
    border: '8px solid var(--swm-purple-light-80)',
  },
  circleStatic: {
    backgroundColor: 'var(--swm-purple-light-100)',
  },
};

const darkStyles = {
  circle: {
    border: '8px solid var(--swm-purple-dark-100)',
  },
  circleStatic: {
    backgroundColor: 'var(--swm-purple-light-100)',
  },
};

const styles = StyleSheet.create({
  container: {
    height: 2 * RADIUS,
    width: 2 * RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: 100,
  },
  circle: {
    height: 56,
    width: 56,
    borderRadius: 100,
    position: 'absolute',
  },
  circleStatic: {
    position: 'absolute',
    height: 40,
    width: 40,
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
