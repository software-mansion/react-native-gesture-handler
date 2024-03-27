import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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

export default function App(props: {
  primaryColor: string;
  highlightColor: string;
}) {
  const chartManager = useRef(new ChartManager());

  const [panHandle, capturedPan, panReset] = useMemo(
    () => chartManager.current.newGesture(Gesture.Pan()),
    []
  );

  const [pressHandle, capturedTap, tapReset] = useMemo(
    () => chartManager.current.newGesture(Gesture.LongPress()),
    []
  );

  const panIds = panHandle.getIdObject();
  const pressIds = pressHandle.getIdObject();

  const panHeaderId = chartManager.current.addHeader('Pan Gesture');
  const tapHeaderId = chartManager.current.addHeader('LongPress Gesture');

  const dimensions = useWindowDimensions();
  const MAX_PHONE_WIDTH = 768;
  const isPhoneMode = dimensions.width < MAX_PHONE_WIDTH;

  // prettier-ignore
  const desktopLayout = [
    [panHeaderId,         ChartManager.EMPTY_SPACE, tapHeaderId,         ChartManager.EMPTY_SPACE],
    [panIds.undetermined, ChartManager.EMPTY_SPACE, pressIds.undetermined, ChartManager.EMPTY_SPACE],
    [panIds.began,        panIds.failed,            pressIds.began,        pressIds.failed],
    [panIds.active,       panIds.cancelled,         pressIds.active,       pressIds.cancelled],
    [panIds.end,          ChartManager.EMPTY_SPACE, pressIds.end,          ChartManager.EMPTY_SPACE],
  ];

  // prettier-ignore
  const phoneLayout = [
    [panHeaderId],
    [panIds.undetermined],
    [panIds.began,        panIds.failed,          ],
    [panIds.active,       panIds.cancelled,       ],
    [panIds.end,          ChartManager.EMPTY_SPACE],
  ];

  chartManager.current.layout = isPhoneMode ? phoneLayout : desktopLayout;

  const pressed = useSharedValue(false);

  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  // IMPORTANT
  // until the issue with GestureHandlers flow isn't resolved,
  // we're adding these temporary arrows connecting BEGAN -> CANCELLED
  chartManager.current.addConnection(panIds.began, panIds.cancelled);
  chartManager.current.addConnection(pressIds.began, pressIds.cancelled);

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

  const tap = Gesture.LongPress().onStart(() => {
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
    backgroundColor: pressed.value ? props.highlightColor : props.primaryColor,
  }));

  useEffect(() => {
    // reset on load
    panReset();
    tapReset();
  });

  return (
    <>
      <View style={[styles.container, styles.chartContainer]}>
        <FlowChart
          chartManager={chartManager.current}
          primaryColor={props.primaryColor}
          highlightColor={props.highlightColor}
          isPhoneMode={isPhoneMode}
        />
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
});
