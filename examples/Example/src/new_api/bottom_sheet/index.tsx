import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  NativeViewGestureHandler,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LoremIpsum } from '../../../src/common';

const HEADER_HEIGTH = 50;
const windowHeight = Dimensions.get('window').height;
const SNAP_POINTS_FROM_TOP = [50, windowHeight * 0.4, windowHeight * 0.8];

const FULLY_OPEN_SNAP_POINT = SNAP_POINTS_FROM_TOP[0];
const CLOSED_SNAP_POINT = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

function Example() {
  const nativeViewRef = useRef(Gesture.Pan());
  const panGestureRef = useRef(Gesture.Pan());
  const blockScrollUntilAtTheTopRef = useRef(Gesture.Tap());
  const [snapPoint, setSnapPoint] = useState(CLOSED_SNAP_POINT);
  const translationY = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const bottomSheetTranslateY = useSharedValue(CLOSED_SNAP_POINT);

  const saveScrollOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.value = e.nativeEvent.contentOffset.y;
  };

  const onPanHandlerUpdate = (e: PanGestureHandlerEventPayload) => {
    translationY.value = e.translationY - scrollOffset.value;
  };

  const onHeaderHandlerUpdate = (e: PanGestureHandlerEventPayload) => {
    translationY.value = e.translationY;
  };

  const onHeaderHandlerEnd = (e: PanGestureHandlerEventPayload) => {
    onHandlerEnd(e);
  };

  const onPanHandlerEnd = (e: PanGestureHandlerEventPayload) => {
    onHandlerEnd(e);
  };

  const onHandlerEnd = ({ velocityY }: PanGestureHandlerEventPayload) => {
    const dragToss = 0.05;
    const endOffsetY =
      bottomSheetTranslateY.value + translationY.value + velocityY * dragToss;

    // calculate nearest snap point
    let destSnapPoint = FULLY_OPEN_SNAP_POINT;

    for (const snapPoint of SNAP_POINTS_FROM_TOP) {
      const distFromSnap = Math.abs(snapPoint - endOffsetY);
      if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
        destSnapPoint = snapPoint;
      }
    }

    // update current translation to be able to animate withSpring to snapPoint
    bottomSheetTranslateY.value =
      bottomSheetTranslateY.value + translationY.value;
    translationY.value = 0;

    bottomSheetTranslateY.value = withSpring(destSnapPoint, {
      mass: 0.5,
    });

    setSnapPoint(destSnapPoint);
  };

  const blockScrollUntilAtTheTop = Gesture.Tap()
    .maxDeltaY(snapPoint - FULLY_OPEN_SNAP_POINT)
    .maxDuration(100000)
    .withRef(blockScrollUntilAtTheTopRef);

  const panGesture = Gesture.Pan()
    .onUpdate(onPanHandlerUpdate)
    .onEnd(onPanHandlerEnd)
    .simultaneousWithExternalGesture(nativeViewRef)
    .withRef(panGestureRef);

  const headerGesture = Gesture.Pan()
    .onUpdate(onHeaderHandlerUpdate)
    .onEnd(onHeaderHandlerEnd);

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    const translateY = bottomSheetTranslateY.value + translationY.value;

    const minTranslateY = Math.max(FULLY_OPEN_SNAP_POINT, translateY);
    const clampedTranslateY = Math.min(CLOSED_SNAP_POINT, minTranslateY);
    return {
      transform: [{ translateY: clampedTranslateY }],
    };
  });

  return (
    <GestureDetector gesture={blockScrollUntilAtTheTop}>
      <View style={styles.container}>
        <LoremIpsum words={200} />
        <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
          <GestureDetector gesture={headerGesture}>
            <View style={styles.header} />
          </GestureDetector>
          <GestureDetector
            gesture={Gesture.Simultaneous(
              panGesture,
              blockScrollUntilAtTheTop
            )}>
            <NativeViewGestureHandler
              ref={nativeViewRef}
              simultaneousHandlers={panGestureRef}
              waitFor={blockScrollUntilAtTheTopRef}>
              <Animated.ScrollView
                bounces={false}
                scrollEventThrottle={1}
                onScrollBeginDrag={saveScrollOffset}>
                <LoremIpsum />
                <LoremIpsum />
                <LoremIpsum />
              </Animated.ScrollView>
            </NativeViewGestureHandler>
          </GestureDetector>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef',
  },
  header: {
    height: HEADER_HEIGTH,
    backgroundColor: 'coral',
  },
  bottomSheet: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff9f7A',
  },
});

export default Example;
