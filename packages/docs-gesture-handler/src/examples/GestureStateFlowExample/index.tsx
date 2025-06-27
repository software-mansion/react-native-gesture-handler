import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ChartManager from './ChartManager';
import FlowChart from './FlowChart';

// widths pulled from CSS
const MIN_DESKTOP_WIDTH = 1298;

export default function App() {
  const chartManager = useMemo(() => new ChartManager(), []);

  const [panHandle, capturedPan, resetPan] = useMemo(
    () => chartManager.newGesture(Gesture.Pan()),
    [chartManager]
  );

  const [pressHandle, capturedPress, resetLongPress] = useMemo(
    () => chartManager.newGesture(Gesture.LongPress()),
    [chartManager]
  );

  const dimensions = useWindowDimensions();
  const isDesktopMode = dimensions.width > MIN_DESKTOP_WIDTH;

  useEffect(() => {
    // Timing issue, neither useEffect, useLayoutEffect or requestAnimationFrame work
    const timeout = setTimeout(() => {
      resetPan();
      resetLongPress();
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [resetLongPress, resetPan]);

  useEffect(() => {
    const panIds = panHandle.idObject;
    const pressIds = pressHandle.idObject;

    // prettier-ignore
    const desktopLayout = [
      [panIds.undetermined, ChartManager.EMPTY_SPACE_ID, pressIds.undetermined, ChartManager.EMPTY_SPACE_ID],
      [panIds.began,        panIds.failed,               pressIds.began,        pressIds.failed],
      [panIds.active,       panIds.cancelled,            pressIds.active,       pressIds.cancelled],
      [panIds.end,          ChartManager.EMPTY_SPACE_ID, pressIds.end,          ChartManager.EMPTY_SPACE_ID],
    ];

    // prettier-ignore
    const phoneLayout = [
      [panIds.undetermined],
      [panIds.began,        panIds.failed],
      [panIds.active,       panIds.cancelled],
      [panIds.end,          ChartManager.EMPTY_SPACE_ID],
    ];

    chartManager.layout = isDesktopMode ? desktopLayout : phoneLayout;
  }, [chartManager, isDesktopMode, panHandle.idObject, pressHandle.idObject]);

  const pressed = useSharedValue(false);
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
    })
    .onStart(() => {
      scale.value = withSpring(0.7);
    })
    .onFinalize(() => {
      offset.value = withSpring(0, { damping: 20, stiffness: 150 });
      scale.value = withTiming(1);
      pressed.value = false;
    })
    .onUpdate((event) => {
      offset.value = event.translationX;
    });

  const press = Gesture.LongPress()
    .onStart(() => {
      scale.value = withSpring(1.3, { stiffness: 175 });
    })
    .onFinalize(() => {
      scale.value = withTiming(1);
    });

  const composedPan = Gesture.Simultaneous(pan, capturedPan);
  const composedPress = Gesture.Simultaneous(press, capturedPress);
  const composed = Gesture.Race(composedPan, composedPress);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(offset.value, { duration: 1000 }) },
      { scale: scale.value },
    ],
    backgroundColor: pressed.value ? '#ffe04b' : '#b58df1',
  }));

  return (
    <>
      <View style={[styles.container, styles.chartContainer]}>
        <View style={styles.row}>
          <Text style={styles.label}>Gesture.Pan()</Text>
          {isDesktopMode && (
            <Text style={styles.label}>Gesture.LongPress()</Text>
          )}
        </View>
        <FlowChart chartManager={chartManager} />
      </View>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container}>
          <GestureDetector gesture={composed}>
            <Animated.View style={[styles.circle, animatedStyles]} />
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 60,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  circle: {
    height: 120,
    width: 120,
    borderRadius: 500,
    cursor: 'grab',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 14,
    color: 'var(--ifm-font-color-base)',
  },
});
