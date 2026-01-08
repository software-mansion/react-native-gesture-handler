import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;
const COLLAPSED_Y = SHEET_HEIGHT - 80;
const SCROLL_THRESHOLD = 2;
const SNAP_THRESHOLD = COLLAPSED_Y / 2;

const springConfig = { damping: 20, stiffness: 90 };

export function BottomSheet() {
  const translateY = useSharedValue(COLLAPSED_Y);
  const context = useSharedValue({ startY: 0 });

  const scrollGesture = Gesture.Scroll()
    .onBegin((event) => {
      'worklet';
      console.log(
        `[BottomSheet] Scroll onBegin - handlerTag: ${event.handlerTag}`
      );
    })
    .onUpdate((event) => {
      'worklet';
      if (event.scrollY > SCROLL_THRESHOLD && translateY.value > 0) {
        translateY.value = withSpring(0, springConfig);
      } else if (
        event.scrollY < -SCROLL_THRESHOLD &&
        translateY.value < COLLAPSED_Y
      ) {
        translateY.value = withSpring(COLLAPSED_Y, springConfig);
      }
    })
    .onEnd((event) => {
      'worklet';
      console.log(
        `[BottomSheet] Scroll onEnd - handlerTag: ${event.handlerTag}, state: ${event.state}, oldState: ${event.oldState}`
      );
    })
    .onFinalize((event) => {
      'worklet';
      console.log(
        `[BottomSheet] Scroll onFinalize - handlerTag: ${event.handlerTag}, state: ${event.state}, oldState: ${event.oldState}`
      );
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      context.value = { startY: translateY.value };
    })
    .onUpdate((event) => {
      'worklet';
      const newTranslateY = context.value.startY + event.translationY;
      translateY.value = Math.max(0, Math.min(COLLAPSED_Y, newTranslateY));
    })
    .onEnd((event) => {
      'worklet';
      const shouldExpand =
        translateY.value < SNAP_THRESHOLD ||
        (event.velocityY < -500 && translateY.value < COLLAPSED_Y);

      if (shouldExpand) {
        translateY.value = withSpring(0, springConfig);
      } else {
        translateY.value = withSpring(COLLAPSED_Y, springConfig);
      }
    });

  const gesture = Gesture.Race(scrollGesture, panGesture);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          translateY.value,
          [0, COLLAPSED_Y],
          [180, 0],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, COLLAPSED_Y],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View style={[styles.sheet, sheetStyle]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.handleContainer}>
          <Animated.View style={[styles.handleArrow, handleStyle]}>
            <Text style={styles.arrowText}>▲</Text>
          </Animated.View>
          <Text style={styles.handleText}>
            Scroll or drag to expand/collapse
          </Text>
        </View>
      </GestureDetector>
      <Animated.ScrollView style={[styles.content, contentOpacity]}>
        <Text style={styles.title}>Bottom Sheet Content</Text>
        <Text style={styles.description}>
          This bottom sheet responds to both scroll and pan gestures. Use mouse
          wheel/trackpad or drag to expand/collapse.
        </Text>
        <View style={styles.items}>
          {Array.from({ length: 100 }).map((_, index) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <View key={`item-${index}`} style={styles.item}>
              <Text style={styles.itemText}>{index}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleArrow: {
    marginBottom: 4,
  },
  arrowText: {
    fontSize: 16,
    color: '#6C63FF',
  },
  handleText: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  itemText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
