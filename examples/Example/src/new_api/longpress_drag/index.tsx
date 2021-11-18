import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

function Ball() {
  const isHighlighted = useSharedValue(false);
  const isPressed = useSharedValue(false);
  const downPosition = useSharedValue({ x: 0, y: 0 });
  const offset = useSharedValue({ x: 0, y: 0 });
  const startTime = useSharedValue(0);
  const highlightTimeoutId = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isHighlighted.value && isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor:
        isHighlighted.value && isPressed.value ? 'yellow' : 'blue',
    };
  });

  function startTimeout() {
    highlightTimeoutId.value = setTimeout(() => {
      isHighlighted.value = true;
    }, 500);
  }

  function stopTimeout() {
    clearTimeout(highlightTimeoutId.value);
  }

  const start = useSharedValue({ x: 0, y: 0 });
  const gesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((e, state) => {
      'worklet';
      downPosition.value = { x: e.touches[0].x, y: e.touches[0].y };
      state.begin();
    })
    .onTouchesUp((_e, state) => {
      'worklet';
      state.end();
    })
    .onTouchesCancelled((_e, state) => {
      'worklet';
      state.end();
    })
    .onTouchesMove((e, state) => {
      'worklet';
      if (Date.now() - startTime.value > 500) {
        state.activate();
      } else if (
        Math.abs(e.touches[0].x - downPosition.value.x) > 2 ||
        Math.abs(e.touches[0].y - downPosition.value.y) > 2
      ) {
        console.log(e.touches[0]);
        console.log(downPosition.value);
        state.fail();
      }
    })
    .onBegan(() => {
      'worklet';
      startTime.value = Date.now();
      isPressed.value = true;
      isHighlighted.value = false;
      runOnJS(startTimeout)();
      console.log('begin');
    })
    .onUpdate((e) => {
      'worklet';
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      'worklet';
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
      isPressed.value = false;
      isHighlighted.value = false;
      runOnJS(stopTimeout)();
      console.log('end');
    });

  return (
    <GestureDetector animatedGesture={gesture}>
      <Animated.View style={[styles.ball, animatedStyles]} />
    </GestureDetector>
  );
}

export default function Example() {
  return (
    <View style={styles.container}>
      <Ball />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
