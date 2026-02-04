import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function App() {
  const angle = useSharedValue(0);
  const startAngle = useSharedValue(0);
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const pointerPositionX = useSharedValue(0);
  const pointerPositionY = useSharedValue(0);
  const negativePointerPositionX = useSharedValue(0);
  const negativePointerPositionY = useSharedValue(0);
  const touchOpacity = useSharedValue(0);
  const grabbing = useSharedValue(false);

  const boxRef = React.useRef(null);

  function updateCenter() {
    if (!boxRef.current) return;

    boxRef.current.measureInWindow((x, y, width, height) => {
      centerX.value = x + width / 2;
      centerY.value = y + height / 2;
    });
  }

  React.useEffect(() => {
    updateCenter();
  }, [boxRef.current]);

  React.useEffect(() => {
    window.addEventListener('resize', updateCenter);
    window.addEventListener('scroll', updateCenter);

    return () => {
      window.removeEventListener('resize', updateCenter);
      window.removeEventListener('scroll', updateCenter);
    };
  }, []);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onBegin((event) => {
      startAngle.value =
        angle.value -
        Math.atan2(
          event.absoluteY - centerY.value,
          event.absoluteX - centerX.value
        );
      touchOpacity.value = withTiming(0.4, { duration: 200 });
      grabbing.value = true;

      pointerPositionX.value = event.absoluteX - centerX.value - 12;
      pointerPositionY.value = event.absoluteY - centerY.value - 12;
      negativePointerPositionX.value = centerX.value - event.absoluteX - 12;
      negativePointerPositionY.value = centerY.value - event.absoluteY - 12;
    })
    .onUpdate((event) => {
      angle.value =
        startAngle.value +
        Math.atan2(
          event.absoluteY - centerY.value,
          event.absoluteX - centerX.value
        );
      pointerPositionX.value = event.absoluteX - centerX.value - 12;
      pointerPositionY.value = event.absoluteY - centerY.value - 12;
      negativePointerPositionX.value = centerX.value - event.absoluteX - 12;
      negativePointerPositionY.value = centerY.value - event.absoluteY - 12;
    })
    .onFinalize(() => {
      touchOpacity.value = withTiming(0, { duration: 200 });
      grabbing.value = false;
    });

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}rad` }],
    cursor: grabbing.value ? 'grabbing' : 'grab',
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View
          ref={boxRef}
          style={[styles.box, boxAnimatedStyles]}></Animated.View>
      </GestureDetector>
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [
              { translateX: pointerPositionX },
              { translateY: pointerPositionY },
            ],
            opacity: touchOpacity,
          },
        ]}></Animated.View>
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [
              { translateX: negativePointerPositionX },
              { translateY: negativePointerPositionY },
            ],
            opacity: touchOpacity,
          },
        ]}></Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#b58df1',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    position: 'absolute',
    left: '50%',
    top: '50%',
    pointerEvents: 'none',
  },
});
