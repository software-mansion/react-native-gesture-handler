import Animated, {
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureStateManager,
  GestureTouchEvent,
} from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';

import React from 'react';

let id = 0;

function Ball() {
  const isPressed = useSharedValue(false);
  const start = useSharedValue({ x: 0, y: 0 });
  const absolute = useSharedValue({ x: 0, y: 0 });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: absolute.value.x - start.value.x },
        { translateY: absolute.value.y - start.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? 'blue' : 'navy',
    };
  });

  const gesture = Gesture.Pan()
    .manualActivation(true)
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
    })
    .onTouchesDown((e) => {
      start.value = {
        x: e.changedTouches[0].absoluteX,
        y: e.changedTouches[0].absoluteY,
      };
      absolute.value = {
        x: e.changedTouches[0].absoluteX,
        y: e.changedTouches[0].absoluteY,
      };
    })
    .onTouchesMove((e: GestureTouchEvent, state: GestureStateManager) => {
      state.activate();
      absolute.value = {
        x: e.changedTouches[0].absoluteX,
        y: e.changedTouches[0].absoluteY,
      };
    })
    .onTouchesUp(() => {
      start.value = { x: 0, y: 0 };
      absolute.value = { x: 0, y: 0 };
    });

  id++;

  return (
    <GestureDetector gesture={Gesture.Simultaneous(gesture)}>
      <View>
        <Animated.View style={[styles.ball, animatedStyles]}>
          <Text style={{ color: 'white', fontSize: 40 }}>{id}</Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default function GestureHandlerExample() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Ball />
      <Ball />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
    opacity: 0.5,
  },
});
