import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeGesture } from 'react-native-gesture-handler';
import {
  GestureDetector,
  useNativeGesture,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Photo gallery from the "Gestures and ScrollView" guide: pinch and double tap
// to zoom, pan while zoomed, swipe vertically to dismiss, drag to scroll.

const PHOTOS = [
  { color: '#e76f51', label: 'Sunset' },
  { color: '#2a9d8f', label: 'Lake' },
  { color: '#e9c46a', label: 'Dunes' },
  { color: '#264653', label: 'Night' },
  { color: '#f4a261', label: 'Canyon' },
  { color: '#8ab17d', label: 'Forest' },
];

const ZOOM = 2.5;
const WIDTH = 200;
const HEIGHT = 260;
const DISMISS_DISTANCE = 120;

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

function scale3(s: number) {
  'worklet';
  return [s, 0, 0, 0, s, 0, 0, 0, 1];
}

function translate3(tx: number, ty: number) {
  'worklet';
  return [1, 0, 0, 0, 1, 0, tx, ty, 1];
}

function matrixScale(matrix: number[]) {
  'worklet';
  return Math.hypot(matrix[0], matrix[1]);
}

function createMatrix(
  translation: { x: number; y: number },
  scale: number,
  origin: { x: number; y: number }
) {
  'worklet';
  let matrix = identity3();
  if (scale !== 1) {
    matrix = multiply3(matrix, translate3(origin.x, origin.y));
    matrix = multiply3(matrix, scale3(scale));
    matrix = multiply3(matrix, translate3(-origin.x, -origin.y));
  }
  if (translation.x !== 0 || translation.y !== 0) {
    matrix = multiply3(matrix, translate3(translation.x, translation.y));
  }
  return matrix;
}

// Translation arrives in parent coordinates; the in-progress transform is
// applied before the accumulated matrix, so divide it by the matrix scale.
function applyTransformations(
  translation: { x: number; y: number },
  scale: number,
  origin: { x: number; y: number },
  matrix: number[]
) {
  'worklet';
  const s = matrixScale(matrix);
  const transform = createMatrix(
    { x: translation.x / s, y: translation.y / s },
    scale,
    origin
  );
  return multiply3(transform, matrix);
}

type PhotoProps = {
  color: string;
  label: string;
  scrollGesture: NativeGesture;
  scrollEnabled: SharedValue<boolean>;
};

function Photo({ color, label, scrollGesture, scrollEnabled }: PhotoProps) {
  const transform = useSharedValue(identity3());
  const translation = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const origin = useSharedValue({ x: 0, y: 0 });
  const zoomed = useSharedValue(false);
  const notZoomed = useSharedValue(true);
  const dismissY = useSharedValue(0);
  const opacity = useSharedValue(1);
  // Set while a double-tap animation runs, so that a gesture ending in the
  // meantime (a real tap always jitters a little) doesn't fold mid-animation.
  // Each animation gets an id, so a cancelled spring's callback can't clear
  // the flag of the animation that replaced it.
  const animating = useSharedValue(false);
  const animationId = useSharedValue(0);
  // Web only: while zoomed, the browser must not scroll the list from a
  // drag on the photo. Native platforms ignore `touchAction`.
  const [isZoomed, setIsZoomed] = useState(false);

  const setZoomed = (value: boolean) => {
    'worklet';
    zoomed.value = value;
    notZoomed.value = !value;
    scrollEnabled.value = !value;
    scheduleOnRN(setIsZoomed, value);
  };

  const isZoomedNow = () => {
    'worklet';
    return matrixScale(transform.value) * scale.value > 1.01;
  };

  // The matrix currently on screen, including in-progress gesture values and
  // whatever a running animation has reached.
  const currentMatrix = () => {
    'worklet';
    return applyTransformations(
      translation.value,
      scale.value,
      origin.value,
      transform.value
    );
  };

  // Folds the on-screen state into the matrix, cancelling any animation.
  // The id is bumped first: assigning `scale` cancels a running spring, whose
  // callback fires synchronously and must see that it is no longer current.
  const settle = () => {
    'worklet';
    animationId.value += 1;
    animating.value = false;
    transform.value = currentMatrix();
    translation.value = { x: 0, y: 0 };
    scale.value = 1;
    origin.value = { x: 0, y: 0 };
    setZoomed(matrixScale(transform.value) > 1.01);
  };

  const fold = () => {
    'worklet';
    if (animating.value) {
      return;
    }
    settle();
  };

  const startAnimation = () => {
    'worklet';
    animating.value = true;
    animationId.value += 1;
    return animationId.value;
  };

  const reset = () => {
    'worklet';
    // Unfold what is on screen into a center pivot, then animate both parts
    // to rest.
    const id = startAnimation();
    const m = currentMatrix();
    transform.value = identity3();
    origin.value = { x: 0, y: 0 };
    scale.value = matrixScale(m);
    translation.value = { x: m[6], y: m[7] };
    translation.value = withSpring({ x: 0, y: 0 });
    scale.value = withSpring(1, {}, () => {
      if (animationId.value === id) {
        animating.value = false;
      }
    });
    setZoomed(false);
  };

  // Not zoomed, the ScrollView must not keep a two-finger gesture: the pinch
  // runs alongside it and disables it as soon as it begins.
  const pinch = usePinchGesture({
    simultaneousWith: scrollGesture,
    onBegin: () => {
      scrollEnabled.value = false;
    },
    onActivate: (e) => {
      if (animating.value) {
        settle();
      }
      origin.value = {
        x: -(e.focalX - WIDTH / 2),
        y: -(e.focalY - HEIGHT / 2),
      };
    },
    onUpdate: (e) => {
      scale.value *= e.scaleChange;
    },
    onDeactivate: () => {
      fold();
      if (!zoomed.value) {
        reset();
      }
    },
    onFinalize: () => {
      scrollEnabled.value = !zoomed.value;
    },
  });

  // Always running, so that pinch and pan switch without lifting all fingers.
  // It moves the photo only while zoomed; with one finger on an unzoomed
  // photo it does nothing and the ScrollView scrolls.
  const pan = usePanGesture({
    simultaneousWith: scrollGesture,
    averageTouches: true,
    minDistance: 1,
    onUpdate: (e) => {
      if (!isZoomedNow()) {
        return;
      }
      translation.value = {
        x: translation.value.x + e.changeX,
        y: translation.value.y + e.changeY,
      };
    },
    onDeactivate: () => {
      fold();
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: (e) => {
      if (zoomed.value) {
        reset();
        return;
      }
      if (animating.value) {
        settle();
      }
      origin.value = { x: -(e.x - WIDTH / 2), y: -(e.y - HEIGHT / 2) };
      setZoomed(true);
      const id = startAnimation();
      // Target the absolute zoom level, whatever the matrix holds already.
      scale.value = withSpring(ZOOM / matrixScale(transform.value), {}, () => {
        if (animationId.value === id) {
          animating.value = false;
          settle();
        }
      });
    },
  });

  // Vertical one-finger swipe on an unzoomed photo dismisses it. Direction
  // criteria keep it away from the horizontal scroll.
  const dismiss = usePanGesture({
    enabled: notZoomed,
    maxPointers: 1,
    activeOffsetY: [-10, 10],
    failOffsetX: [-10, 10],
    onUpdate: (e) => {
      dismissY.value = e.translationY;
    },
    onDeactivate: (e) => {
      if (Math.abs(e.translationY) > DISMISS_DISTANCE) {
        dismissY.value = withTiming(Math.sign(e.translationY) * 1000);
        opacity.value = withTiming(0);
        return;
      }
      dismissY.value = withSpring(0);
    },
  });

  const gesture = useSimultaneousGestures(pinch, pan, doubleTap, dismiss);

  const style = useAnimatedStyle(() => {
    const matrix = applyTransformations(
      translation.value,
      scale.value,
      origin.value,
      transform.value
    );
    return {
      opacity: opacity.value,
      transform: [
        { translateX: matrix[6] },
        { translateY: matrix[7] + dismissY.value },
        { scale: matrixScale(matrix) },
      ],
    };
  });

  return (
    <GestureDetector
      gesture={gesture}
      touchAction={isZoomed ? 'none' : 'pan-x'}>
      <Animated.View style={[styles.photo, { backgroundColor: color }, style]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function Example() {
  const scrollEnabled = useSharedValue(true);
  const scrollGesture = useNativeGesture({ enabled: scrollEnabled });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={scrollGesture}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.gallery}
          showsHorizontalScrollIndicator={false}>
          {PHOTOS.map((photo) => (
            <Photo
              key={photo.label}
              {...photo}
              scrollGesture={scrollGesture}
              scrollEnabled={scrollEnabled}
            />
          ))}
        </ScrollView>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  gallery: {
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  photo: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: 16,
    justifyContent: 'flex-end',
    padding: 16,
  },
  label: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
});
