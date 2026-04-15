import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export default function App() {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const grabbing = useSharedValue(false);
  const maxTranslateX = useSharedValue(0);
  const maxTranslateY = useSharedValue(0);

  const containerRef = React.useRef(null);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
    cursor: grabbing.value ? 'grabbing' : 'grab',
  }));

  const updateWidthAndHeight = () => {
    if (!containerRef.current) return;

    containerRef.current.measureInWindow((x, y, width, height) => {
      maxTranslateX.value = width / 2 - 50;
      maxTranslateY.value = height / 2 - 50;
    });
  };

  React.useEffect(() => {
    updateWidthAndHeight();
  }, [containerRef.current]);

  React.useEffect(() => {
    window.addEventListener('resize', updateWidthAndHeight);
    window.addEventListener('scroll', updateWidthAndHeight);

    return () => {
      window.removeEventListener('resize', updateWidthAndHeight);
      window.removeEventListener('scroll', updateWidthAndHeight);
    };
  }, []);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      grabbing.value = true;
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      translationX.value = clamp(
        prevTranslationX.value + event.translationX,
        -maxTranslateX.value,
        maxTranslateX.value
      );
      translationY.value = clamp(
        prevTranslationY.value + event.translationY,
        -maxTranslateY.value,
        maxTranslateY.value
      );
    })
    .onFinalize(() => {
      grabbing.value = false;
    });

  return (
    <GestureHandlerRootView>
      <View ref={containerRef} style={styles.container}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[animatedStyles, styles.box]}></Animated.View>
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
    aspectRatio: 3,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#b58df1',
    borderRadius: 20,
  },
});
