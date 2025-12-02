import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  useCompetingGestures,
  useLongPressGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
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
  const tap = useTapGesture({
    onDeactivate: () => {
      'worklet';
      if (savedRotation.value === 0 && scale.value === maxScale) {
        runOnJS(setLocked)(false);
      }
    },
  });

  // Long press to cancel tap
  const longPress = useLongPressGesture({});

  const confirm = useCompetingGestures(longPress, tap);

  const rotationGesture = useRotationGesture({
    onUpdate: (e) => {
      'worklet';
      rotation.value = savedRotation.value + e.rotation;

      if (!locked) {
        runOnJS(setLocked)(true);
      }
    },
    onDeactivate: () => {
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
    simultaneousWith: confirm,
  });

  const pinchGesture = usePinchGesture({
    onUpdate: (e) => {
      'worklet';
      const value = savedScale.value * e.scale;
      if (value < minScale || value > maxScale) {
        return;
      }
      scale.value = value;

      if (!locked) {
        runOnJS(setLocked)(true);
      }
    },
    onDeactivate: () => {
      'worklet';

      if (Math.abs(scale.value - maxScale) < scaleThreshold) {
        scale.value = withTiming(maxScale, { duration: 300 });
      } else {
        scale.value = withTiming(minScale, { duration: 300 });
      }
      savedScale.value = scale.value;
    },
    simultaneousWith: confirm,
  });

  const unlockingGesture = useSimultaneousGestures(
    rotationGesture,
    pinchGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${(rotation.value / Math.PI) * 180}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.outerBox}>
        <GestureDetector gesture={unlockingGesture}>
          <Animated.View style={[styles.box, animatedStyle]}>
            <GestureDetector gesture={confirm}>
              <Text style={styles.lockIcon}>{locked ? '🔒' : '🔓'}</Text>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
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
