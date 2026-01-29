import * as React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';

import { COLORS } from './colors';
import Animated, {
  setNativeProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

let numberOfRenders = 0;

export default function SharedValueBinding() {
  numberOfRenders++;

  const animatedRef = useAnimatedRef<typeof AnimatedTextInput>();
  const color = useSharedValue(COLORS.KINDA_RED);
  const minTaps = useSharedValue(1);

  const style = useAnimatedStyle(() => {
    return {
      backgroundColor: color.value,
    };
  });

  const tap = useTapGesture({
    numberOfTaps: minTaps,
    onActivate: () => {
      'worklet';
      minTaps.value++;
      color.value = withTiming(COLORS.KINDA_GREEN, { duration: 150 }, () => {
        'worklet';
        color.value = withTiming(COLORS.KINDA_RED, { duration: 150 });
      });
    },
  });

  useAnimatedReaction(
    () => minTaps.value,
    (taps) => {
      setNativeProps(animatedRef, {
        text: `${taps} tap${taps > 1 ? 's' : ''} required to activate`,
      });
    }
  );

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18 }}>Number of renders: {numberOfRenders}</Text>
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            {
              width: 100,
              height: 100,
              borderRadius: 50,
            },
            style,
          ]}
        />
      </GestureDetector>
      <AnimatedTextInput
        style={{ fontSize: 18 }}
        ref={animatedRef}
        editable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
});
