import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const DELTA_SCROLL_MULTIPLIER = 50;
const TOTAL_SCROLL_MULTIPLIER = 10;
const SCROLL_SCALE_MULTIPLIER = 1.05;

interface ScrollBoxProps {
  color: string;
  title: string;
  useDeltas: boolean;
  useSpring: boolean;
  onSpringChange: (value: boolean) => void;
}

export function ScrollBox({
  color,
  title,
  useDeltas,
  useSpring: useSpringAnimation,
  onSpringChange,
}: ScrollBoxProps) {
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const deltaX = useSharedValue(0);
  const deltaY = useSharedValue(0);
  const isScrolling = useSharedValue(false);

  const gesture = Gesture.Scroll()
    .onBegin((event) => {
      'worklet';
      isScrolling.value = true;
      console.log(
        `[${title}] Scroll onBegin - handlerTag: ${event.handlerTag}, state: ${event.state}`
      );
    })
    .onUpdate((event) => {
      'worklet';
      scrollX.value = event.scrollX;
      scrollY.value = event.scrollY;
      deltaX.value = event.deltaX;
      deltaY.value = event.deltaY;
    })
    .onEnd((event) => {
      'worklet';
      console.log(
        `[${title}] Scroll onEnd - handlerTag: ${event.handlerTag}, state: ${event.state}, oldState: ${event.oldState}`
      );
    })
    .onFinalize(() => {
      'worklet';
      isScrolling.value = false;
      scrollX.value = 0;
      scrollY.value = 0;
      deltaX.value = 0;
      deltaY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const x = useDeltas
      ? deltaX.value * DELTA_SCROLL_MULTIPLIER
      : scrollX.value * TOTAL_SCROLL_MULTIPLIER;
    const y = useDeltas
      ? deltaY.value * DELTA_SCROLL_MULTIPLIER
      : scrollY.value * TOTAL_SCROLL_MULTIPLIER;

    const targetX = isScrolling.value
      ? x
      : useSpringAnimation
        ? withSpring(0)
        : 0;
    const targetY = isScrolling.value
      ? -y
      : useSpringAnimation
        ? withSpring(0)
        : 0;

    return {
      transform: [
        { translateX: isScrolling.value ? x : targetX },
        { translateY: isScrolling.value ? -y : targetY },
        { scale: isScrolling.value ? SCROLL_SCALE_MULTIPLIER : 1 },
      ],
      opacity: isScrolling.value ? 0.8 : 1,
    };
  });

  return (
    <View style={styles.boxContainer}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.sublabel}>
        {useDeltas ? '(deltaX/deltaY)' : '(scrollX/scrollY)'}
      </Text>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.box, { backgroundColor: color }, animatedStyle]}
        />
      </GestureDetector>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Spring</Text>
        <Switch
          value={useSpringAnimation}
          onValueChange={onSpringChange}
          trackColor={{ false: '#ccc', true: color }}
          thumbColor={useSpringAnimation ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  switchLabel: {
    fontSize: 12,
    color: '#666',
  },
  box: {
    width: 120,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
