import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import ChartManager, { State } from './ChartManager';
import FlowChart from './FlowChart';

enum States {
  UNDETERMINED = 0,
  FAILED = 1,
  BEGAN = 2,
  CANCELLED = 3,
  ACTIVE = 4,
  END = 5,
}
export default function App() {
  const chartManager = useRef(new ChartManager());
  const [undeterminedCallback, undeterminedId] = useMemo(
    () => chartManager.current.addElement(State.UNDETERMINED, 'Gesture.pan()'),
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
        'Called when realeased out of bounds'
      ),
    [chartManager]
  );

  const [tapUndeterminedCallback, tapUndeterminedId] = useMemo(
    () => chartManager.current.addElement(State.UNDETERMINED, 'Gesture.tap()'),
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

  // horizontal layout
  chartManager.current.layout = [
    [undeterminedId, beganId, activeId, endId],
    [ChartManager.EMPTY_SPACE, failedId, cancelledId, tapActiveId],
  ];

  // vertical layout
  chartManager.current.layout = [
    [
      undeterminedId,
      ChartManager.EMPTY_SPACE,
      ChartManager.EMPTY_SPACE,
      tapUndeterminedId,
    ],
    [beganId, failedId, ChartManager.EMPTY_SPACE, tapActiveId],
    [activeId, cancelledId, ChartManager.EMPTY_SPACE, ChartManager.EMPTY_SPACE],
    [
      endId,
      ChartManager.EMPTY_SPACE,
      ChartManager.EMPTY_SPACE,
      ChartManager.EMPTY_SPACE,
    ],
  ];

  useEffect(() => {
    chartManager.current.addConnection(undeterminedId, beganId);
    chartManager.current.addConnection(beganId, activeId);
    chartManager.current.addConnection(beganId, failedId);
    chartManager.current.addConnection(activeId, endId);
    chartManager.current.addConnection(activeId, cancelledId);

    chartManager.current.addConnection(tapUndeterminedId, tapActiveId);
  }, [chartManager]);

  const pressed = useSharedValue(false);

  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  undeterminedCallback(true);

  const resetAllStates = (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    beganCallback(false);
    activeCallback(false);
    undeterminedCallback(true);
    if (event.state == States.FAILED) {
      failedCallback(true);
    }
    if (event.state == States.CANCELLED) {
      cancelledCallback(true);
    }
    setTimeout(() => {
      endCallback(false);
      failedCallback(false);
      cancelledCallback(false);
    }, 200);
  };

  // highlight-start
  const pan = Gesture.Pan()
    .onBegin(() => {
      beganCallback(true);
      undeterminedCallback(false);
      pressed.value = true;
    })
    .onStart(() => {
      scale.value = withSpring(0.6, { duration: 150 });
      beganCallback(false);
      activeCallback(true);
    })
    .onEnd(() => {
      endCallback(true);
    })
    .onFinalize((event) => {
      resetAllStates(event);
      offset.value = withSpring(0, { duration: 200 });
      scale.value = withTiming(1);
      pressed.value = false;
    })
    .onUpdate((event) => {
      offset.value = event.translationX;
    });

  const tap = Gesture.Tap()
    .onStart(() => {
      tapActiveCallback(true);
      tapUndeterminedCallback(false);
      scale.value = withSequence(
        withSpring(1.8, { duration: 90 }),
        withSpring(1, { duration: 180, dampingRatio: 0.4 })
      );
    })
    .onFinalize(() => {
      setTimeout(() => {
        tapActiveCallback(false);
        tapUndeterminedCallback(true);
      }, 200);
    });
  // highlight-end

  const composed = Gesture.Race(pan, tap);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(offset.value, {}) },
      { scale: scale.value },
    ],
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
