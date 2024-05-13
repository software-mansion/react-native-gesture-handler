import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
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
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const pointerPositionX = useSharedValue(0);
  const pointerPositionY = useSharedValue(0);
  const negativePointerPositionX = useSharedValue(0);
  const negativePointerPositionY = useSharedValue(0);

  const touchOpacity = useSharedValue(0);

  const containerRef = React.useRef(null);
  const boxRef = React.useRef(null);

  function updateCenterAndDimensions() {
    if (boxRef.current) {
      boxRef.current.measureInWindow((x, y, width, height) => {
        centerX.value = x + width / 2;
        centerY.value = y + height / 2;
      });
    }

    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, w, h) => {
        width.value = w;
        height.value = h;

        boxWidth.value = clamp(
          boxWidth.value,
          100,
          Math.min(w, h)
        );
      });
    }
  }

  React.useEffect(() => {
    updateCenterAndDimensions();
  }, [boxRef.current, containerRef.current]);

  React.useEffect(() => {
    window.addEventListener('resize', updateCenterAndDimensions);
    window.addEventListener('scroll', updateCenterAndDimensions);

    return () => {
      window.removeEventListener('resize', updateCenterAndDimensions);
      window.removeEventListener('scroll', updateCenterAndDimensions);
    };
  }, []);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart((event) => {
      const distanceX = Math.abs(event.absoluteX - centerX.value);
      const distanceY = Math.abs(event.absoluteY - centerY.value);
      const width = Math.max(distanceX, distanceY) * 2;
      distanceDifference.value = boxWidth.value - width;

      touchOpacity.value = withTiming(0.4, { duration: 200 });
    })
    .onUpdate((event) => {
      const distanceX = Math.abs(event.absoluteX - centerX.value);
      const distanceY = Math.abs(event.absoluteY - centerY.value);
      boxWidth.value = clamp(
        Math.max(distanceX, distanceY) * 2 + distanceDifference.value,
        100,
        Math.min(width.value, height.value)
      );

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
    <GestureHandlerRootView>
      <View ref={containerRef} style={styles.container}>
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
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 3,
  },
  box: {
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#b58df1',
    cursor: 'pointer',
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
