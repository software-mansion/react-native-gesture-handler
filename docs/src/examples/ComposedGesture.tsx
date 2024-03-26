import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
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
} from 'react-native-gesture-handler';
import ChartManager from './ChartManager';
import FlowChart from './FlowChart';

export enum States {
  UNDETERMINED = 0,
  FAILED = 1,
  BEGAN = 2,
  CANCELLED = 3,
  ACTIVE = 4,
  END = 5,
}
export default function App() {
  // if chartman would take care of the connections and also gesture capturing,
  // we would only need to segregate between pan and tap
  // auto connections
  // const panHandler = useMemo(() => chartManager.capture(pan))
  // panHandler.capture(State.BEGAN) // only adds this one to the list
  // panHandler.captureAll() // auto connects all that need to be connected
  // panHandler.connectAll() // this one is a part of the capAll, will connect based on a lookup list
  // layout = [panHandler.beganId, ..., ...]

  const chartManager = useRef(new ChartManager());

  const [panHandle, capturedPan, panReset] = chartManager.current.newGesture(
    Gesture.Pan()
  );

  const [tapHandle, capturedTap, tapReset] = chartManager.current.newGesture(
    Gesture.Tap()
  );

  const panIds = panHandle.getIdObject();
  const tapIds = tapHandle.getIdObject();

  const panHeaderId = chartManager.current.addHeader('Pan Gesture');
  const tapHeaderId = chartManager.current.addHeader('Tap Gesture');

  // FIXME: tap seems to be broken, and does not follow the typical flow, thus it's quite a bad flow example :P

  // vertical layout
  // prettier-ignore
  chartManager.current.layout = [
    [panHeaderId,         ChartManager.EMPTY_SPACE, tapHeaderId,         ChartManager.EMPTY_SPACE],
    [panIds.undetermined, ChartManager.EMPTY_SPACE, tapIds.undetermined, ChartManager.EMPTY_SPACE],
    [panIds.began,        panIds.failed,            tapIds.began,        tapIds.failed],
    [panIds.active,       panIds.cancelled,         tapIds.active,       tapIds.cancelled],
    [panIds.end,          ChartManager.EMPTY_SPACE, tapIds.end,          ChartManager.EMPTY_SPACE],
  ];

  const pressed = useSharedValue(false);

  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  // highlight-start
  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
    })
    .onStart(() => {
      scale.value = withSpring(0.6, { duration: 150 });
    })
    .onFinalize(() => {
      offset.value = withSpring(0, { duration: 200 });
      scale.value = withTiming(1);
      pressed.value = false;
    })
    .onUpdate((event) => {
      offset.value = event.translationX;
    });

  const tap = Gesture.Tap().onStart(() => {
    scale.value = withSequence(
      withSpring(1.8, { duration: 90 }),
      withSpring(1, { duration: 180, dampingRatio: 0.4 })
    );
  });
  // highlight-end

  const composedPan = Gesture.Simultaneous(pan, capturedPan);
  const composedTap = Gesture.Simultaneous(tap, capturedTap);
  const composed = Gesture.Race(composedPan, composedTap);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(offset.value, { duration: 1000 }) },
      { scale: scale.value },
    ],
    backgroundColor: pressed.value ? '#ffe04b' : '#b58df1',
  }));

  useEffect(() => {
    // reset on load
    panReset();
    tapReset();
  });

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
