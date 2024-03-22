import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useRef } from 'react';
import { Easing, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ChartManager, { State } from './ChartManager';
import FlowChart from './FlowChart';

const STATE_FAILED = 1;
const STATE_CANCELLED = 3;

export default function App() {
  const chartManager = useRef(new ChartManager());
  const [undeterminedCallback, undeterminedId] = useMemo(
    () =>
      chartManager.current.addElement(
        State.UNDETERMINED,
        'This is the default state'
      ),
    [chartManager]
  );

  const [beganCallback, beganId] = useMemo(
    () => chartManager.current.addElement(State.BEGAN),
    [chartManager]
  );

  const [activeCallback, activeId] = useMemo(
    () => chartManager.current.addElement(State.ACTIVE),
    [chartManager]
  );

  const [endCallback, endId] = useMemo(
    () => chartManager.current.addElement(State.END),
    [chartManager]
  );

  const [failedCallback, failedId] = useMemo(
    () => chartManager.current.addElement(State.FAILED),
    [chartManager]
  );

  const [cancelledCallback, cancelledId] = useMemo(
    () =>
      chartManager.current.addElement(
        State.CANCELLED,
        'This is some sample text'
      ),
    [chartManager]
  );

  const [tapActiveCallback, tapActiveId] = useMemo(
    () =>
      chartManager.current.addElement(
        State.ACTIVE,
        'This one activates on tap'
      ),
    [chartManager]
  );

  useEffect(() => {
    chartManager.current.addConnection(undeterminedId, beganId);
    chartManager.current.addConnection(beganId, activeId);
    chartManager.current.addConnection(beganId, failedId);
    chartManager.current.addConnection(activeId, endId);
    chartManager.current.addConnection(activeId, cancelledId);
  }, [chartManager]);

  const pressed = useSharedValue(false);

  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  undeterminedCallback(true);

  // highlight-start
  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
      beganCallback(true);
      undeterminedCallback(false);
    })
    .onStart(() => {
      scale.value = withSpring(0.6, { duration: 200 });
      beganCallback(false);
      activeCallback(true);
    })
    .onEnd(() => {
      endCallback(true);
    })
    .onFinalize((event, success) => {
      beganCallback(false);
      activeCallback(false);
      if (event.state == STATE_FAILED) {
        failedCallback(true);
      }
      if (event.state == STATE_CANCELLED) {
        cancelledCallback(true);
      }
      setTimeout(() => {
        endCallback(false);
        failedCallback(false);
        cancelledCallback(false);
        undeterminedCallback(true);
      }, 200);
      offset.value = withSpring(0);
      scale.value = withTiming(1);
      pressed.value = false;
    })
    .onUpdate((event) => {
      offset.value = event.translationX;
    });
  const tap = Gesture.Tap()
    .onStart(() => {
      tapActiveCallback(true);
      scale.value = withSequence(
        withSpring(1.8, { duration: 70 }),
        withSpring(1, { duration: 140, dampingRatio: 0.4 })
      );
    })
    .onFinalize(() => {
      setTimeout(() => {
        tapActiveCallback(false);
      }, 200);
    });
  // highlight-end

  const composed = Gesture.Race(pan, tap);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { scale: scale.value }],
    backgroundColor: pressed.value ? '#ffe04b' : '#b58df1',
  }));

  return (
    <>
      <View style={[styles.container, styles.chartContainer]}>
        <FlowChart chartManager={chartManager.current} />
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
    backgroundColor: '#b58df1',
    borderRadius: 500,
    cursor: 'grab',
  },
});
