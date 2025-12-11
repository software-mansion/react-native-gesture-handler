import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Switch,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;
const COLLAPSED_TRANSLATE_Y = BOTTOM_SHEET_HEIGHT - 80; // Only show 80px when collapsed
const SCROLL_THRESHOLD = 2; // Amount of scroll needed to trigger expand/collapse
const SNAP_THRESHOLD = COLLAPSED_TRANSLATE_Y / 2; // Threshold for snapping to expanded/collapsed

const DELTA_SCROLL_MULTIPLIER = 50;
const TOTAL_SCROLL_MULTIPLIER = 10;
const SCROLL_SCALE_MULTIPLIER = 1.05;

function ScrollBottomSheet() {
  const translateY = useSharedValue(COLLAPSED_TRANSLATE_Y);
  const context = useSharedValue({ startY: 0 });

  const springConfig = {
    damping: 20,
    stiffness: 90,
  };

  // Scroll gesture for mouse wheel / trackpad
  const scrollGesture = Gesture.Scroll()
    .onBegin((event) => {
      'worklet';
      console.log(
        `[BottomSheet] Scroll onBegin - handlerTag: ${event.handlerTag}`
      );
    })
    .onUpdate((event) => {
      'worklet';
      // Positive scrollY means scrolling up (away from user) -> expand
      // Negative scrollY means scrolling down (toward user) -> collapse
      if (event.scrollY > SCROLL_THRESHOLD && translateY.value > 0) {
        translateY.value = withSpring(0, springConfig);
      } else if (
        event.scrollY < -SCROLL_THRESHOLD &&
        translateY.value < COLLAPSED_TRANSLATE_Y
      ) {
        translateY.value = withSpring(COLLAPSED_TRANSLATE_Y, springConfig);
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

  // Pan gesture for touch/drag
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      context.value = { startY: translateY.value };
    })
    .onUpdate((event) => {
      'worklet';
      // Dragging down = positive translationY = increase translateY (collapse)
      // Dragging up = negative translationY = decrease translateY (expand)
      const newTranslateY = context.value.startY + event.translationY;
      // Clamp between 0 (fully expanded) and COLLAPSED_TRANSLATE_Y (collapsed)
      translateY.value = Math.max(
        0,
        Math.min(COLLAPSED_TRANSLATE_Y, newTranslateY)
      );
    })
    .onEnd((event) => {
      'worklet';
      // Snap to expanded or collapsed based on position and velocity
      const shouldExpand =
        translateY.value < SNAP_THRESHOLD ||
        (event.velocityY < -500 && translateY.value < COLLAPSED_TRANSLATE_Y);

      if (shouldExpand) {
        translateY.value = withSpring(0, springConfig);
      } else {
        translateY.value = withSpring(COLLAPSED_TRANSLATE_Y, springConfig);
      }
    });

  // Combine gestures - Race means the first gesture to activate wins
  const gesture = Gesture.Race(scrollGesture, panGesture);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          translateY.value,
          [0, COLLAPSED_TRANSLATE_Y],
          [180, 0],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, COLLAPSED_TRANSLATE_Y],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bottomSheet, sheetStyle]}>
        <View style={styles.handleContainer}>
          <Animated.View style={[styles.handleArrow, handleStyle]}>
            <Text style={styles.arrowText}>▲</Text>
          </Animated.View>
          <Text style={styles.handleText}>
            Scroll or drag to expand/collapse
          </Text>
        </View>
        <Animated.View style={[styles.sheetContent, contentOpacity]}>
          <Text style={styles.sheetTitle}>Bottom Sheet Content</Text>
          <Text style={styles.sheetDescription}>
            This bottom sheet responds to both scroll and pan gestures. Use
            mouse wheel/trackpad or drag to expand/collapse.
          </Text>
          <View style={styles.sheetItems}>
            {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item) => (
              <View key={item} style={styles.sheetItem}>
                <Text style={styles.sheetItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function ScrollBox({
  color,
  title,
  useDeltas,
  useSpring,
  onSpringChange,
}: {
  color: string;
  title: string;
  useDeltas: boolean;
  useSpring: boolean;
  onSpringChange: (value: boolean) => void;
}) {
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
      console.log(
        `[${title}] Scroll: x=${event.scrollX.toFixed(2)}, y=${event.scrollY.toFixed(2)}, deltaX=${event.deltaX.toFixed(2)}, deltaY=${event.deltaY.toFixed(2)}`
      );
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
      // Reset values - spring will be applied based on useSpring prop
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

    // Apply spring only when resetting (when not scrolling)
    const targetX = isScrolling.value ? x : useSpring ? withSpring(0) : 0;
    const targetY = isScrolling.value ? -y : useSpring ? withSpring(0) : 0;

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
          value={useSpring}
          onValueChange={onSpringChange}
          trackColor={{ false: '#ccc', true: color }}
          thumbColor={useSpring ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

export default function ScrollExample() {
  const [totalScrollSpring, setTotalScrollSpring] = useState(true);
  const [deltaScrollSpring, setDeltaScrollSpring] = useState(true);

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scroll Gesture</Text>
        <Text style={styles.unsupported}>
          This gesture is only available on Android.
        </Text>
        <Text style={styles.description}>
          The Scroll gesture responds to mouse wheel and trackpad scroll events
          (ACTION_SCROLL from Android).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scroll Gesture</Text>

      <Text style={styles.description}>
        Use your mouse wheel or trackpad to scroll over the elements below.
      </Text>

      <Text style={styles.sectionTitle}>Box Demo</Text>
      <Text style={styles.sectionDescription}>
        Compare total scroll (scrollX/scrollY) vs delta values (deltaX/deltaY)
      </Text>

      <View style={styles.boxesRow}>
        <ScrollBox
          color="#6C63FF"
          title="Total Scroll"
          useDeltas={false}
          useSpring={totalScrollSpring}
          onSpringChange={setTotalScrollSpring}
        />
        <ScrollBox
          color="#FF6B6B"
          title="Delta Scroll"
          useDeltas={true}
          useSpring={deltaScrollSpring}
          onSpringChange={setDeltaScrollSpring}
        />
      </View>

      <Text style={styles.hint}>
        💡 Tip: Check the console for scroll event logs
      </Text>

      <Text style={styles.hint}>
        💡 Scroll or drag on the bottom sheet to expand/collapse it
      </Text>

      <ScrollBottomSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  unsupported: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 10,
    fontWeight: '600',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
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
  hint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  // Bottom Sheet styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
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
  sheetContent: {
    flex: 1,
    paddingBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  sheetItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sheetItem: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sheetItemText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
