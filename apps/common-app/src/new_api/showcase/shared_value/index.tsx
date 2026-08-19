import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  Touchable,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, commonStyles, useIndexedLogger } from '../../../common';

export default function SharedValueConfigExample() {
  const numberOfTaps = useSharedValue(1);
  const flashProgress = useSharedValue(0);
  const log = useIndexedLogger();

  const tap = useTapGesture({
    numberOfTaps,
    onBegin: () => {
      log('onBegin');
    },
    onActivate: () => {
      log('onActivate');
      flashProgress.value = 1;
      flashProgress.value = withTiming(0, { duration: 400 });
    },
    onDeactivate: () => {
      log('onDeactivate');
    },
    onFinalize: () => {
      log('onFinalize');
    },
  });

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flashProgress.value,
      [0, 1],
      [COLORS.NAVY, COLORS.KINDA_BLUE]
    ),
  }));

  return (
    <View style={styles.container}>
      <Text style={commonStyles.instructions}>
        The button raises the number of taps the gesture requires. The gesture
        reads it from a shared value, so the screen never re-renders. Open the
        console to follow the gesture callbacks.
      </Text>

      <GestureDetector gesture={tap}>
        <Animated.View
          testID="shared-value-box"
          style={[commonStyles.box, boxStyle]}
        />
      </GestureDetector>

      <Touchable
        testID="increment-taps-button"
        style={styles.button}
        activeOpacity={0.6}
        animationDuration={{ in: 80, out: 200 }}
        onPress={() => {
          // Reading `numberOfTaps.value` back right after the write still gives
          // the old value, so the new one has to be kept in a local.
          const requiredTaps = numberOfTaps.value + 1;
          numberOfTaps.value = requiredTaps;
          log(`Required taps: ${requiredTaps}`);
        }}>
        <Text style={styles.buttonLabel}>Increment required taps</Text>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },

  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.PURPLE,
    borderRadius: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
