import Animated, {
  useAnimatedStyle,
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

function Ball() {
  const isPressed = useSharedValue(false);
  const isPressed2 = useSharedValue(false);

  const start = useSharedValue({ x: 0, y: 0 });
  const start2 = useSharedValue({ x: 0, y: 0 });

  const absolute = useSharedValue({ x: 0, y: 0 });
  const absolute2 = useSharedValue({ x: 0, y: 0 });

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
  const animatedStyles2 = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: absolute2.value.x - start2.value.x },
        { translateY: absolute2.value.y - start2.value.y },
        { scale: withSpring(isPressed2.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed2.value ? 'lime' : 'green',
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
  const gesture2 = Gesture.Pan()
    .manualActivation(true)
    .onBegin(() => {
      'worklet';
      isPressed2.value = true;
    })
    .onFinalize(() => {
      'worklet';
      isPressed2.value = false;
    })
    .onTouchesDown((e) => {
      start2.value = {
        x: e.changedTouches[0].absoluteX,
        y: e.changedTouches[0].absoluteY,
      };
      absolute2.value = {
        x: e.changedTouches[0].absoluteX,
        y: e.changedTouches[0].absoluteY,
      };
    })
    .onTouchesMove((e: GestureTouchEvent, state: GestureStateManager) => {
      state.activate();
      absolute2.value = {
        x: e.changedTouches[0].absoluteX,
        y: e.changedTouches[0].absoluteY,
      };
    })
    .onTouchesUp(() => {
      start2.value = { x: 0, y: 0 };
      absolute2.value = { x: 0, y: 0 };
    });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(gesture, gesture2)}>
      <View>
        <Animated.View style={[styles.ball, animatedStyles]}>
          <Text style={{ color: 'white', fontSize: 40 }}>1</Text>
        </Animated.View>
        <Animated.View
          style={[styles.ball, animatedStyles2, { marginTop: -100 }]}>
          <Text style={{ color: 'white', fontSize: 40 }}>2</Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default function GestureHandlerExample() {
  return (
    <GestureHandlerRootView style={styles.container}>
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
    alignSelf: 'center',
    opacity: 0.5,
  },
});
