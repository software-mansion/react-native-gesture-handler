import React, { useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeDetector,
  PanGestureEvent,
  useNative,
  usePan,
  useSimultaneous,
  useTap,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LoremIpsum } from '../../common';

const HEADER_HEIGTH = 50;
const windowHeight = Dimensions.get('window').height;
const SNAP_POINTS_FROM_TOP = [50, windowHeight * 0.4, windowHeight * 0.8];

const FULLY_OPEN_SNAP_POINT = SNAP_POINTS_FROM_TOP[0];
const CLOSED_SNAP_POINT = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

function Example() {
  const [snapPoint, setSnapPoint] = useState(CLOSED_SNAP_POINT);
  const translationY = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const bottomSheetTranslateY = useSharedValue(CLOSED_SNAP_POINT);

  const onHandlerEndOnJS = (point: number) => {
    setSnapPoint(point);
  };
  const onHandlerEnd = (e: PanGestureEvent) => {
    'worklet';
    const dragToss = 0.01;
    const endOffsetY =
      bottomSheetTranslateY.value +
      translationY.value +
      e.handlerData.velocityY * dragToss;

    // calculate nearest snap point
    let destSnapPoint = FULLY_OPEN_SNAP_POINT;

    if (
      snapPoint === FULLY_OPEN_SNAP_POINT &&
      endOffsetY < FULLY_OPEN_SNAP_POINT
    ) {
      return;
    }
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
    runOnJS(onHandlerEndOnJS)(destSnapPoint);
  };
  const panGesture = usePan({
    onUpdate: (e) => {
      'worklet';
      // when bottom sheet is not fully opened scroll offset should not influence
      // its position (prevents random snapping when opening bottom sheet when
      // the content is already scrolled)
      if (snapPoint === FULLY_OPEN_SNAP_POINT) {
        translationY.value = e.handlerData.translationY - scrollOffset.value;
      } else {
        translationY.value = e.handlerData.translationY;
      }
    },
    onEnd: onHandlerEnd,
  });

  const blockScrollUntilAtTheTop = useTap({
    maxDeltaY: snapPoint - FULLY_OPEN_SNAP_POINT,
    maxDuration: 100000,
    simultaneousWithExternalGesture: panGesture,
  });

  const headerGesture = usePan({
    onUpdate: (e) => {
      'worklet';
      translationY.value = e.handlerData.translationY;
    },
    onEnd: onHandlerEnd,
  });

  const scrollViewGesture = useNative({
    requireExternalGestureToFail: blockScrollUntilAtTheTop,
  });

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    const translateY = bottomSheetTranslateY.value + translationY.value;

    const minTranslateY = Math.max(FULLY_OPEN_SNAP_POINT, translateY);
    const clampedTranslateY = Math.min(CLOSED_SNAP_POINT, minTranslateY);
    return {
      transform: [{ translateY: clampedTranslateY }],
    };
  });

  const simultanousGesture = useSimultaneous(panGesture, scrollViewGesture);

  return (
    <View style={styles.container}>
      <LoremIpsum words={200} />
      <NativeDetector gesture={blockScrollUntilAtTheTop}>
        <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
          <NativeDetector gesture={headerGesture}>
            <View style={styles.header} />
          </NativeDetector>
          <NativeDetector gesture={simultanousGesture}>
            <Animated.ScrollView
              bounces={false}
              scrollEventThrottle={1}
              onScrollBeginDrag={(
                e: NativeSyntheticEvent<NativeScrollEvent>
              ) => {
                scrollOffset.value = e.nativeEvent.contentOffset.y;
              }}>
              <LoremIpsum />
              <LoremIpsum />
              <LoremIpsum />
            </Animated.ScrollView>
          </NativeDetector>
        </Animated.View>
      </NativeDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
