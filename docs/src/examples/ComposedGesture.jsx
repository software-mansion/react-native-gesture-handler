import 'react-native-gesture-handler';
import React from 'react';
import { Easing, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

export default function App() {
  const pressed = useSharedValue(false);
  const tapped = useSharedValue(false);

  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  // highlight-start
  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
    })
    .onStart(() => {
      scale.value = withSpring(0.6, { duration: 200 });
    })
    .onChange((event) => {
      offset.value = event.translationX;
    })
    .onFinalize(() => {
      offset.value = withSpring(0);
      scale.value = withTiming(1);
      pressed.value = false;
    });

  const tap = Gesture.Tap()
    .onBegin(() => {
      tapped.value = true;
    })
    .onStart(() => {
      scale.value = withSequence(
        withSpring(1.8, { duration: 80, easing: Easing.ease }),
        withSpring(1, { duration: 160, easing: Easing.ease })
      );
    })
    .onFinalize(() => {
      tapped.value = false;
    });
  // highlight-end

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { scale: scale.value }],
    backgroundColor: pressed.value ? '#ffe04b' : '#b58df1',
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <GestureDetector gesture={tap}>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.circle, animatedStyles]} />
          </GestureDetector>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  circle: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 500,
    cursor: 'grab',
  },
});
