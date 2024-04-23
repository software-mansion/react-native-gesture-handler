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

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export default function App() {
  const boxWidth = useSharedValue(100);
  const distanceDifference = useSharedValue(0);
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const pointerPositionX = useSharedValue(0);
  const pointerPositionY = useSharedValue(0);
  const negativePointerPositionX = useSharedValue(0);
  const negativePointerPositionY = useSharedValue(0);
  const touchOpacity = useSharedValue(0);

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

    return () => {
      window.removeEventListener('resize', updateCenter);
    };
  }, []);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart((event) => {
        const distanceX = Math.abs(event.absoluteX - centerX.value);
        const distanceY = Math.abs(event.absoluteY - centerY.value);
        const width = Math.max(distanceX, distanceY) * 2;
        distanceDifference.value = boxWidth.value - width;
        console.log(distanceDifference.value);

        touchOpacity.value = withTiming(0.4, { duration: 200 });
    })
    .onUpdate((event) => {
        const distanceX = Math.abs(event.absoluteX - centerX.value);
        const distanceY = Math.abs(event.absoluteY - centerY.value);
        boxWidth.value = clamp(Math.max(distanceX, distanceY) * 2  + distanceDifference.value, 100, 300);

        pointerPositionX.value = event.absoluteX - centerX.value - 12;
        pointerPositionY.value = event.absoluteY - centerY.value - 12;
        negativePointerPositionX.value = centerX.value - event.absoluteX - 12;
        negativePointerPositionY.value = centerY.value - event.absoluteY - 12;
    })
    .onEnd(() => {
      touchOpacity.value = withTiming(0, { duration: 200 });
    });

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    width: boxWidth.value,
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
    aspectRatio: 2,
  },
  box: {
    aspectRatio: 1,
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
  },
});
