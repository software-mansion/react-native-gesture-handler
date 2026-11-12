import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeGesture } from 'react-native-gesture-handler';
import {
  GestureDetector,
  GestureHandlerRootView,
  useNativeGesture,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ROWS = Array.from({ length: 30 }, (_, i) => i);

type RowProps = {
  index: number;
  scrollGesture: NativeGesture;
};

function Row({ index, scrollGesture }: RowProps) {
  const translateX = useSharedValue(0);

  const pan = usePanGesture({
    activeOffsetX: [-20, 20],
    failOffsetY: [-10, 10],
    block: scrollGesture,
    onUpdate: (e) => {
      translateX.value = e.translationX;
    },
    onDeactivate: () => {
      translateX.value = withSpring(0);
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, style]}>
        <Text>Row {index}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function App() {
  const scrollGesture = useNativeGesture({});

  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: (e) => {
      console.log('drag started at', e.contentOffset.y);
    },
    onEndDrag: (e) => {
      console.log('drag ended at', e.contentOffset.y);
    },
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={scrollGesture}>
        <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
          {ROWS.map((i) => (
            <Row key={i} index={i} scrollGesture={scrollGesture} />
          ))}
        </Animated.ScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
});
