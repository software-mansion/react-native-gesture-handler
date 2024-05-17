import { StyleSheet, View } from 'react-native';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const BOX_SIZE = 120;

export default function App() {
  const aref = useAnimatedRef<View>();
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const pan = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onChange((event) => {
      offsetX.value += event.changeX;
      offsetY.value += event.changeY;
    })
    .onFinalize((event) => {
      isPressed.value = false;
      // If we can't get view size, just ignore it. Half of the view will be
      // able to go outside the screen
      const size = measure(aref) ?? { width: 0, height: 0 };

      offsetX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-size.width / 2 + BOX_SIZE / 2, size.width / 2 - BOX_SIZE / 2],
        rubberBandEffect: true,
        rubberBandFactor: 0.75,
      });

      offsetY.value = withDecay({
        velocity: event.velocityY,
        clamp: [
          -size.height / 2 + BOX_SIZE / 2,
          size.height / 2 - BOX_SIZE / 2,
        ],
        rubberBandEffect: true,
        rubberBandFactor: 0.75,
      });
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: isPressed.value ? 1.2 : 1 },
    ],
    backgroundColor: isPressed.value ? '#FFD61E' : '#001A72',
  }));

  return (
    <View style={styles.container} ref={aref} collapsable={false}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.box, animatedStyles]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: BOX_SIZE / 2,
    //@ts-expect-error
    cursor: 'grab',
  },
});
