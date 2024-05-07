import React from 'react';
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export default function App() {
  const translateX = useSharedValue(0);
  const startTranslateX = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  const containerRef = React.useRef(null);

  const updateContainerWidth = () => {
    if (!containerRef.current) return;

    containerRef.current.measure((x, y, width, height) => {
      containerWidth.value = width;

      translateX.value = clamp(
        translateX.value,
        containerWidth.value / -2 + 50,
        containerWidth.value / 2 - 50
      );
    });
  };

  React.useEffect(() => {
    updateContainerWidth();
  }, [containerRef.current]);

  React.useEffect(() => {
    window.addEventListener('resize', updateContainerWidth);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  const fling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .onBegin((event) => {
      startTranslateX.value = event.x;
    })
    .onStart((event) => {
      translateX.value = withTiming(
        clamp(
          translateX.value + event.x - startTranslateX.value,
          containerWidth.value / -2 + 50,
          containerWidth.value / 2 - 50
        ),
        { duration: 200 }
      );
    });

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView>
      <View ref={containerRef} style={styles.container}>
        <GestureDetector gesture={fling}>
          <Animated.View
            style={[styles.box, boxAnimatedStyles]}></Animated.View>
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
  },
  box: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#b58df1',
    cursor: 'grab',
  },
});
