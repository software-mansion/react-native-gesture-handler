import React, { useEffect, useMemo, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { PanGestureActiveEvent } from 'react-native-gesture-handler';
import {
  GestureDetector,
  useNativeGesture,
  usePanGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, commonStyles, LoremIpsum } from '../../../common';

const HEADER_HEIGTH = 50;
const CLOSED_SNAP_POINT_INDEX = 2;

function Example() {
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const snapPointsFromTop = useMemo(
    () => [50, containerHeight * 0.4, containerHeight * 0.8],
    [containerHeight]
  );
  const fullyOpenSnapPoint = snapPointsFromTop[0];
  const closedSnapPoint = snapPointsFromTop[CLOSED_SNAP_POINT_INDEX];
  const [snapPointIndex, setSnapPointIndex] = useState(CLOSED_SNAP_POINT_INDEX);
  const translationY = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const bottomSheetTranslateY = useSharedValue(closedSnapPoint);
  const snapPointIndexValue = useSharedValue(CLOSED_SNAP_POINT_INDEX);

  useEffect(() => {
    bottomSheetTranslateY.value = snapPointsFromTop[snapPointIndexValue.value];
  }, [bottomSheetTranslateY, snapPointIndexValue, snapPointsFromTop]);

  const onHandlerDeactivate = (e: PanGestureActiveEvent) => {
    const dragToss = 0.01;
    const endOffsetY =
      bottomSheetTranslateY.value + translationY.value + e.velocityY * dragToss;

    // calculate nearest snap point
    let destSnapPointIndex = 0;

    if (snapPointIndex === 0 && endOffsetY < fullyOpenSnapPoint) {
      return;
    }
    for (const [index, snapPoint] of snapPointsFromTop.entries()) {
      const distFromSnap = Math.abs(snapPoint - endOffsetY);
      if (
        distFromSnap <
        Math.abs(snapPointsFromTop[destSnapPointIndex] - endOffsetY)
      ) {
        destSnapPointIndex = index;
      }
    }

    // update current translation to be able to animate withSpring to snapPoint
    bottomSheetTranslateY.value =
      bottomSheetTranslateY.value + translationY.value;
    translationY.value = 0;

    snapPointIndexValue.value = destSnapPointIndex;
    bottomSheetTranslateY.value = withSpring(
      snapPointsFromTop[destSnapPointIndex],
      {
        mass: 0.5,
      }
    );
    runOnJS(setSnapPointIndex)(destSnapPointIndex);
  };
  const panGesture = usePanGesture({
    onUpdate: (e) => {
      // when bottom sheet is not fully opened scroll offset should not influence
      // its position (prevents random snapping when opening bottom sheet when
      // the content is already scrolled)
      if (snapPointIndex === 0) {
        translationY.value = e.translationY - scrollOffset.value;
      } else {
        translationY.value = e.translationY;
      }
    },
    onDeactivate: onHandlerDeactivate,
  });

  const blockScrollUntilAtTheTop = useTapGesture({
    maxDeltaY: snapPointsFromTop[snapPointIndex] - fullyOpenSnapPoint,
    maxDuration: 100000,
    simultaneousWith: panGesture,
  });

  const headerGesture = usePanGesture({
    onUpdate: (e) => {
      translationY.value = e.translationY;
    },
    onDeactivate: onHandlerDeactivate,
  });

  const scrollViewGesture = useNativeGesture({
    requireToFail: blockScrollUntilAtTheTop,
  });

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    const translateY = bottomSheetTranslateY.value + translationY.value;

    const minTranslateY = Math.max(fullyOpenSnapPoint, translateY);
    const clampedTranslateY = Math.min(closedSnapPoint, minTranslateY);
    return {
      transform: [{ translateY: clampedTranslateY }],
    };
  });

  const simultanousGesture = useSimultaneousGestures(
    panGesture,
    scrollViewGesture
  );

  return (
    <View
      style={[commonStyles.centerView, styles.container]}
      onLayout={({ nativeEvent }) => {
        setContainerHeight(nativeEvent.layout.height);
      }}>
      <LoremIpsum words={200} />
      <GestureDetector gesture={blockScrollUntilAtTheTop}>
        <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
          <GestureDetector gesture={headerGesture}>
            <View style={styles.header} />
          </GestureDetector>
          <GestureDetector gesture={simultanousGesture}>
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
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    height: HEADER_HEIGTH,
    backgroundColor: COLORS.NAVY,
  },
  bottomSheet: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.KINDA_BLUE,
  },
});

export default Example;
