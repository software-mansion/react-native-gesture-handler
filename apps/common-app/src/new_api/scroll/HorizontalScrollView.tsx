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

const VIEWPORT_WIDTH = Dimensions.get('window').width - 40;
const CONTENT_WIDTH = 1200;
const SCROLL_SENSITIVITY = 15;
const OVERSCROLL_RESISTANCE = 0.3;
const BOUNCE_SPRING_CONFIG = { damping: 20, stiffness: 200 };

export function HorizontalScrollView() {
  const scrollOffset = useSharedValue(0);
  const maxScroll = CONTENT_WIDTH - VIEWPORT_WIDTH;

  const scrollGesture = Gesture.Scroll()
    .onBegin((event) => {
      'worklet';
      console.log(
        `[HorizontalScrollView] Scroll onBegin - handlerTag: ${event.handlerTag}`
      );
    })
    .onUpdate((event) => {
      'worklet';
      const delta = -event.deltaX * SCROLL_SENSITIVITY;
      const newOffset = scrollOffset.value + delta;

      if (newOffset < 0) {
        scrollOffset.value = newOffset * OVERSCROLL_RESISTANCE;
      } else if (newOffset > maxScroll) {
        const overscroll = newOffset - maxScroll;
        scrollOffset.value = maxScroll + overscroll * OVERSCROLL_RESISTANCE;
      } else {
        scrollOffset.value = newOffset;
      }
    })
    .onEnd(() => {
      'worklet';
      if (scrollOffset.value < 0) {
        scrollOffset.value = withSpring(0, BOUNCE_SPRING_CONFIG);
      } else if (scrollOffset.value > maxScroll) {
        scrollOffset.value = withSpring(maxScroll, BOUNCE_SPRING_CONFIG);
      }
    })
    .onFinalize((event) => {
      'worklet';
      console.log(
        `[HorizontalScrollView] Scroll onFinalize - handlerTag: ${event.handlerTag}, state: ${event.state}`
      );
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollOffset.value }],
  }));

  const scrollbarStyle = useAnimatedStyle(() => {
    const scrollbarWidth = (VIEWPORT_WIDTH / CONTENT_WIDTH) * VIEWPORT_WIDTH;
    const scrollProgress = Math.max(
      0,
      Math.min(1, scrollOffset.value / maxScroll)
    );
    const scrollbarLeft = scrollProgress * (VIEWPORT_WIDTH - scrollbarWidth);

    return {
      width: scrollbarWidth,
      transform: [{ translateX: scrollbarLeft }],
      opacity: interpolate(
        Math.abs(
          scrollOffset.value -
            Math.max(0, Math.min(maxScroll, scrollOffset.value))
        ),
        [0, 20],
        [0.5, 0.8],
        Extrapolation.CLAMP
      ),
    };
  });

  const items = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    title: `Card ${i + 1}`,
    color: `hsl(${(i * 24) % 360}, 70%, 60%)`,
  }));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Gesture-Based Horizontal ScrollView</Text>
      <Text style={styles.subtitle}>
        Built entirely with Scroll gesture handler
      </Text>

      <GestureDetector gesture={scrollGesture}>
        <View style={styles.scrollContainer}>
          <Animated.View style={[styles.scrollContent, contentStyle]}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: item.color }]}>
                <Text style={styles.cardNumber}>{item.id + 1}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            ))}
          </Animated.View>

          <View style={styles.scrollbarTrack}>
            <Animated.View style={[styles.scrollbarThumb, scrollbarStyle]} />
          </View>
        </View>
      </GestureDetector>

      <Text style={styles.hint}>
        ↔️ Scroll horizontally • Overscroll bounces back
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  scrollContainer: {
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  card: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.9,
  },
  cardTitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.8,
  },
  scrollbarTrack: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 6,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
  },
  scrollbarThumb: {
    height: 4,
    backgroundColor: 'rgba(108, 99, 255, 0.5)',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  hint: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});
