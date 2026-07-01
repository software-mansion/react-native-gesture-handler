import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

// @ts-ignore it's an image
import SIGNET from '../../../ListWithHeader/signet.png';

function identity3() {
  'worklet';
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

function multiply3(a: number[], b: number[]) {
  'worklet';
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

function scale3(sx: number, sy: number) {
  'worklet';
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
}

function translate3(tx: number, ty: number) {
  'worklet';
  return [1, 0, 0, 0, 1, 0, tx, ty, 1];
}

function rotate3(rad: number) {
  'worklet';
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function invert2(m: number[]) {
  'worklet';
  const a = m[0];
  const b = m[1];
  const c = m[2];
  const d = m[3];
  const det = a * d - b * c;

  if (Math.abs(det) < 1e-6) {
    return [1, 0, 0, 1];
  }

  return [d / det, -b / det, -c / det, a / det];
}

function toTransformedCoords(
  point: { x: number; y: number },
  matrix: number[]
) {
  'worklet';
  const m2 = [matrix[0], matrix[1], matrix[3], matrix[4]];
  const inv = invert2(m2);
  const x = point.x;
  const y = point.y;
  const newX = inv[0] * x + inv[2] * y;
  const newY = inv[1] * x + inv[3] * y;

  return { x: newX, y: newY };
}

function createMatrix(
  translation: { x: number; y: number },
  scale: number,
  rotation: number,
  origin: { x: number; y: number }
) {
  'worklet';
  let matrix = identity3();

  if (scale !== 1) {
    matrix = multiply3(matrix, translate3(origin.x, origin.y));
    matrix = multiply3(matrix, scale3(scale, scale));
    matrix = multiply3(matrix, translate3(-origin.x, -origin.y));
  }
  if (rotation !== 0) {
    matrix = multiply3(matrix, translate3(origin.x, origin.y));
    matrix = multiply3(matrix, rotate3(-rotation));
    matrix = multiply3(matrix, translate3(-origin.x, -origin.y));
  }

  if (translation.x !== 0 || translation.y !== 0) {
    matrix = multiply3(matrix, translate3(translation.x, translation.y));
  }

  return matrix;
}

function applyTransformations(
  translation: { x: number; y: number },
  scale: number,
  rotation: number,
  origin: { x: number; y: number },
  matrix: number[]
) {
  'worklet';
  const translationInViewCoords = toTransformedCoords(translation, matrix);
  const transform = createMatrix(
    translationInViewCoords,
    scale,
    rotation,
    origin
  );
  return multiply3(transform, matrix);
}

function Photo() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const translation = useSharedValue({ x: 0, y: 0 });
  const origin = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const isRotating = useSharedValue(false);
  const isScaling = useSharedValue(false);

  const transform = useSharedValue(identity3());

  const style = useAnimatedStyle(() => {
    const matrix = applyTransformations(
      translation.value,
      scale.value,
      rotation.value,
      origin.value,
      transform.value
    );

    return {
      transform: [
        { translateX: matrix[6] },
        { translateY: matrix[7] },
        { scale: Math.hypot(matrix[0], matrix[1]) },
        { rotateZ: `${Math.atan2(matrix[1], matrix[0])}rad` },
      ],
    };
  });

  const rotationGesture = useRotationGesture({
    onActivate: (e) => {
      if (!isRotating.value && !isScaling.value) {
        origin.value = {
          x: -(e.anchorX - size.width / 2),
          y: -(e.anchorY - size.height / 2),
        };
      }
      isRotating.value = true;
    },
    onUpdate: (e) => {
      rotation.value += e.rotationChange;
    },
    onDeactivate: () => {
      transform.value = applyTransformations(
        translation.value,
        scale.value,
        rotation.value,
        origin.value,
        transform.value
      );

      rotation.value = 0;
      translation.value = { x: 0, y: 0 };
      scale.value = 1;
      isRotating.value = false;
    },
  });

  const scaleGesture = usePinchGesture({
    onActivate: (e) => {
      if (!isRotating.value && !isScaling.value) {
        origin.value = {
          x: -(e.focalX - size.width / 2),
          y: -(e.focalY - size.height / 2),
        };
      }
      isScaling.value = true;
    },
    onUpdate: (e) => {
      scale.value *= e.scaleChange;
    },
    onDeactivate: () => {
      transform.value = applyTransformations(
        translation.value,
        scale.value,
        rotation.value,
        origin.value,
        transform.value
      );
      rotation.value = 0;
      translation.value = { x: 0, y: 0 };
      scale.value = 1;
      isScaling.value = false;
    },
  });

  const panGesture = usePanGesture({
    averageTouches: true,
    onUpdate: (e) => {
      translation.value = {
        x: translation.value.x + e.changeX,
        y: translation.value.y + e.changeY,
      };
    },
    onDeactivate: () => {
      transform.value = applyTransformations(
        translation.value,
        scale.value,
        rotation.value,
        origin.value,
        transform.value
      );

      rotation.value = 0;
      translation.value = { x: 0, y: 0 };
      scale.value = 1;
    },
  });

  const doubleTapGesture = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: () => {
      scale.value *= 1.25;
    },
  });

  const gesture = useSimultaneousGestures(
    rotationGesture,
    scaleGesture,
    panGesture,
    doubleTapGesture
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={({ nativeEvent }) => {
          setSize({
            width: nativeEvent.layout.width,
            height: nativeEvent.layout.height,
          });
        }}
        style={[styles.container, style]}>
        <Image source={SIGNET} style={styles.image} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Photo />
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 240,
    height: 240,
    backgroundColor: '#eef0ff',
    padding: 16,
    elevation: 8,
    borderRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: 208,
    height: 208,
  },
});
