import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  NativeDetector,
  useExclusive,
  useLongPress,
  usePinch,
  useRotation,
  useSimultaneous,
  useTap,
} from 'react-native-gesture-handler';

export default function Lock() {
  const rotation = useSharedValue(-Math.PI / 2);
  const savedRotation = useSharedValue(-Math.PI / 2);

  const scale = useSharedValue(0.6);
  const savedScale = useSharedValue(1);

  const [locked, setLocked] = useState(true);
  const snapThreshold = 0.4;
  const scaleThreshold = 0.1;
  const minScale = 0.5;
  const maxScale = 1;
  const TWO_PI = 2 * Math.PI;

  // Tap to lock
  const tap = useTap({
    onEnd: () => {
      'worklet';
      if (savedRotation.value === 0 && scale.value === maxScale) {
        runOnJS(setLocked)(false);
      }
    },
  });

  // Long press to cancel tap
  const longPress = useLongPress({});

  const confirm = useExclusive(longPress, tap);

  const rotationGesture = useRotation({
    onUpdate: (e) => {
      'worklet';
      rotation.value = savedRotation.value + e.handlerData.rotation;

      if (!locked) {
        runOnJS(setLocked)(true);
      }
    },
    onEnd: () => {
      'worklet';

      const nearestMultiple = Math.round(rotation.value / TWO_PI) * TWO_PI;

      if (Math.abs(rotation.value - nearestMultiple) < snapThreshold) {
        rotation.value = withTiming(nearestMultiple, { duration: 300 });
        savedRotation.value = 0;
      } else {
        rotation.value = withTiming(-Math.PI / 2, { duration: 300 });
        savedRotation.value = -Math.PI / 2;
      }
    },
    simultaneousWithExternalGesture: confirm,
  });

  const pinchGesture = usePinch({
    onUpdate: (e) => {
      'worklet';
      const value = savedScale.value * e.handlerData.scale;
      if (value < minScale || value > maxScale) {
        return;
      }
      scale.value = value;

      if (!locked) {
        runOnJS(setLocked)(true);
      }
    },
    onEnd: () => {
      'worklet';

      if (Math.abs(scale.value - maxScale) < scaleThreshold) {
        scale.value = withTiming(maxScale, { duration: 300 });
      } else {
        scale.value = withTiming(minScale, { duration: 300 });
      }
      savedScale.value = scale.value;
    },
    simultaneousWithExternalGesture: confirm,
  });

  const unlockingGesture = useSimultaneous(rotationGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${(rotation.value / Math.PI) * 180}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.outerBox}>
        <NativeDetector gesture={unlockingGesture}>
          <Animated.View style={[styles.box, animatedStyle]}>
            <NativeDetector gesture={confirm}>
              <Text style={styles.lockIcon}>{locked ? '🔒' : '🔓'}</Text>
            </NativeDetector>
          </Animated.View>
        </NativeDetector>
      </View>
      <Text>{locked ? 'Locked' : 'Unlocked!'}</Text>
      <Text style={styles.instructions}>
        Tou unlock rotate 90 degrees clockwise, and scale to fill the square.
        Then tap to confirm, longpress to cancel the tap
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  instructions: {
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  outerBox: {
    height: 200,
    width: 200,
    backgroundColor: 'gray',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  box: {
    height: 200,
    width: 200,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
