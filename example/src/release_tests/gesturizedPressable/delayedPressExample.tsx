import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestingBase, { signallerConfig } from './testingBase';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export function DelayedPressExample() {
  const startColor = '#fff';
  const pressColor = '#ff0';
  const longPressColor = '#f0f';
  const animatedColor = useSharedValue(startColor);

  const pressDelay = 1000;

  // original adds this value to the base longPressDuration
  // new implementation uses this value as the longPressDuration
  const longPressDelay = 1000;

  const onPressIn = () => {
    console.log('Pressed with delay');
    animatedColor.value = withSequence(
      withSpring(pressColor, signallerConfig),
      withSpring(startColor, signallerConfig)
    );
  };

  const onLongPress = () => {
    console.log('Long pressed with delay');
    animatedColor.value = withSequence(
      withSpring(longPressColor, signallerConfig),
      withSpring(startColor, signallerConfig)
    );
  };

  const signalerStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedColor.value,
  }));

  return (
    <>
      <Animated.View style={[signalerStyle, styles.signaler]} />
      <View style={styles.container}>
        <TestingBase
          style={styles.pressable}
          delayLongPress={longPressDelay}
          unstable_pressDelay={pressDelay}
          onPressIn={onPressIn}
          onLongPress={onLongPress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    padding: 20,
  },
  pressable: {
    width: 100,
    height: 100,
    backgroundColor: 'mediumpurple',
  },
  signaler: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
