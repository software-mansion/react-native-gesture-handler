import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// PoC proof screen: `enabled` is a SharedValue passed into the gesture config.
// Toggling it exercises bindSharedValues -> attachListener worklet ->
// port.proxy.updateGestureHandlerConfig (raw HostFunction) on the UI runtime —
// the single riskiest path of the hooks-in-core factory design.
export default function SharedValueProof() {
  const enabled = useSharedValue(true);
  const [enabledLabel, setEnabledLabel] = useState(true);
  const [startCount, setStartCount] = useState(0);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const bumpStartCount = () => {
    setStartCount((c) => c + 1);
  };

  const pan = usePanGesture({
    enabled,
    onActivate: () => {
      'worklet';
      runOnJS(bumpStartCount)();
    },
    onUpdate: (event) => {
      'worklet';
      tx.value = event.translationX;
      ty.value = event.translationY;
    },
    onDeactivate: () => {
      'worklet';
      tx.value = withSpring(0);
      ty.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <View style={styles.container}>
      <Button
        title={enabledLabel ? 'Disable gesture' : 'Enable gesture'}
        onPress={() => {
          enabled.value = !enabled.value;
          setEnabledLabel(!enabledLabel);
        }}
      />
      <Text style={styles.status}>
        {`enabled: ${enabledLabel} | starts: ${startCount}`}
      </Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  status: {
    fontSize: 18,
    marginVertical: 16,
  },
  box: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: 'rebeccapurple',
  },
});
