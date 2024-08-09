import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useState } from 'react';

function identity4() {
  'worklet';
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function multiply4(a: number[], b: number[]) {
  'worklet';
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
    a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
    a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
    a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
    a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
    a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
    a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
  ];
}

function scale4(sx: number, sy: number, sz: number) {
  'worklet';
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
}

function translate4(tx: number, ty: number, tz: number) {
  'worklet';
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

function rotate4(rad: number, x: number, y: number, z: number) {
  'worklet';
  const len = Math.hypot(x, y, z);
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const t = 1 - c;
  x /= len;
  y /= len;
  z /= len;
  return [
    t * x * x + c,
    t * x * y - s * z,
    t * x * z + s * y,
    0,
    t * x * y + s * z,
    t * y * y + c,
    t * y * z - s * x,
    0,
    t * x * z - s * y,
    t * y * z + s * x,
    t * z * z + c,
    0,
    0,
    0,
    0,
    1,
  ];
}

function invert2(m: number[]) {
  'worklet';
  const a = m[0];
  const b = m[1];
  const c = m[2];
  const d = m[3];
  const det = a * d - b * c;

  return [d / det, -b / det, -c / det, a / det];
}

function toTransformedCoords(
  point: { x: number; y: number },
  matrix: number[]
) {
  'worklet';
  const m2 = [matrix[0], matrix[1], matrix[4], matrix[5]];
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
  let matrix = identity4();

  if (scale !== 1) {
    matrix = multiply4(matrix, translate4(origin.x, origin.y, 0));
    matrix = multiply4(matrix, scale4(scale, scale, 1));
    matrix = multiply4(matrix, translate4(-origin.x, -origin.y, 0));
  }
  if (rotation !== 0) {
    matrix = multiply4(matrix, translate4(origin.x, origin.y, 0));
    matrix = multiply4(matrix, rotate4(-rotation, 0, 0, 1));
    matrix = multiply4(matrix, translate4(-origin.x, -origin.y, 0));
  }

  if (translation.x !== 0 || translation.y !== 0) {
    matrix = multiply4(matrix, translate4(translation.x, translation.y, 0));
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
  return multiply4(transform, matrix);
}

const SIGNET = require('../../ListWithHeader/signet.png');

function Photo() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const translation = useSharedValue({ x: 0, y: 0 });
  const origin = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const isRotating = useSharedValue(false);
  const isScaling = useSharedValue(false);

  const transform = useSharedValue(identity4());

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
        { translateX: matrix[12] },
        { translateY: matrix[13] },
        { scale: Math.hypot(matrix[0], matrix[1]) },
        { rotateZ: `${Math.atan2(matrix[1], matrix[0])}rad` },
      ],
    };
  });

  const rotationGesture = Gesture.Rotation()
    .onStart((e) => {
      if (!isRotating.value && !isScaling.value) {
        origin.value = {
          x: -(e.anchorX - size.width / 2),
          y: -(e.anchorY - size.height / 2),
        };
      }
      isRotating.value = true;
    })
    .onChange((e) => {
      'worklet';
      rotation.value += e.rotationChange;
    })
    .onEnd(() => {
      'worklet';
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
    });

  const scaleGesture = Gesture.Pinch()
    .onStart((e) => {
      if (!isRotating.value && !isScaling.value) {
        origin.value = {
          x: -(e.focalX - size.width / 2),
          y: -(e.focalY - size.height / 2),
        };
      }
      isScaling.value = true;
    })
    .onChange((e) => {
      'worklet';
      scale.value *= e.scaleChange;
    })
    .onEnd(() => {
      'worklet';
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
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onChange((e) => {
      'worklet';
      translation.value = {
        x: translation.value.x + e.changeX,
        y: translation.value.y + e.changeY,
      };
    })
    .onEnd(() => {
      'worklet';
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
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      'worklet';
      if (success) {
        scale.value *= 1.25;
      }
    });

  const gesture = Gesture.Simultaneous(
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
