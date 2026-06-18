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

import { COLORS, commonStyles } from '../../../common';

export default function SharedValueConfigExample() {
  const numberOfTaps = useSharedValue(1);
  const flashProgress = useSharedValue(0);

  const tap = useTapGesture({
    numberOfTaps,
    onActivate: () => {
      flashProgress.value = 1;
      flashProgress.value = withTiming(0, { duration: 400 });
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
      <GestureDetector gesture={tap}>
        <Animated.View style={[commonStyles.box, boxStyle]} />
      </GestureDetector>

      <Touchable
        style={styles.button}
        activeOpacity={0.6}
        animationDuration={{ in: 80, out: 200 }}
        onPress={() => {
          numberOfTaps.value += 1;
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
