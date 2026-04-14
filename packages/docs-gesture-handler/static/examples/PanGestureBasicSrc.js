import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

export default function App() {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const grabbing = useSharedValue(false);

  const containerRef = React.useRef(null);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
    cursor: grabbing.value ? 'grabbing' : 'grab',
  }));

  const pan = usePanGesture({
    minDistance: 1,
    onBegin: () => {
      grabbing.value = true;
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    },
    onUpdate: (event) => {
      prevTranslationX.value + event.translationX;
      prevTranslationY.value + event.translationY;
    },
    onFinalize: () => {
      grabbing.value = false;
    },
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
