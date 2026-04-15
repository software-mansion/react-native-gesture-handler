import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
  NativeGesture,
  usePinchGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = ['red', 'green', 'blue', 'yellow'];

type ItemProps = {
  backgroundColor: string;
  scrollGesture: NativeGesture | null;
};

function Item({ backgroundColor, scrollGesture }: ItemProps) {
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const pinch = usePinchGesture({
    onBegin: () => {
      zIndex.value = 100;
    },
    onUpdate: (e) => {
      scale.value *= e.scaleChange;
    },
    onFinalize: () => {
      scale.value = withTiming(1, undefined, (finished) => {
        if (finished) {
          zIndex.value = 1;
        }
      });
    },
    block: scrollGesture ?? undefined,
  });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View
        style={[
          { backgroundColor: backgroundColor },
          styles.item,
          animatedStyles,
        ]}
      />
    </GestureDetector>
  );
}

export default function App() {
  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(
    null
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.container}
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER={(gesture) => {
          if (!scrollGesture || scrollGesture.tag !== gesture.tag) {
            setScrollGesture(gesture);
          }
        }}>
        {ITEMS.map((item) => (
          <Item
            backgroundColor={item}
            key={item}
            scrollGesture={scrollGesture}
          />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flex: 1,
    aspectRatio: 1,
  },
});
