import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../../common';
import { USE_NATIVE_DRIVER } from '../../config';

const HEADER_HEIGHT = 50;

export function BottomSheet() {
  const [screenHeight, setScreenHeight] = useState(HEADER_HEIGHT / 0.4 + 1);

  const snapPoints = [HEADER_HEIGHT, screenHeight * 0.4, screenHeight * 0.8];

  const startSnapPoint = snapPoints[0];
  const endSnapPoint = snapPoints[snapPoints.length - 1];

  const [lastSnap, setLastSnap] = useState(endSnapPoint);

  let lastScrollYValue = 0;
  let lastScrollY = new Animated.Value(0);
  let onRegisterLastScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: lastScrollY } } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );
  lastScrollY.addListener(({ value }) => {
    lastScrollYValue = value;
  });

  let dragY = new Animated.Value(0);

  let reverseLastScrollY = Animated.multiply(
    new Animated.Value(-1),
    lastScrollY
  );

  let translateYOffset = new Animated.Value(endSnapPoint);
  let translateY = Animated.add(
    translateYOffset,
    Animated.add(dragY, reverseLastScrollY)
  ).interpolate({
    inputRange: [startSnapPoint, endSnapPoint],
    outputRange: [startSnapPoint, endSnapPoint],
    extrapolate: 'clamp',
  });

  const onHandlerStateChange = (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    let { velocityY, translationY } = event;
    translationY -= lastScrollYValue;
    const dragToss = 0.05;
    const endOffsetY = lastSnap + translationY + dragToss * velocityY;

    let destSnapPoint = snapPoints[0];
    for (const snapPoint of snapPoints) {
      const distFromSnap = Math.abs(snapPoint - endOffsetY);
      if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
        destSnapPoint = snapPoint;
      }
    }
    setLastSnap(destSnapPoint);
    translateYOffset.extractOffset();
    translateYOffset.setValue(translationY);
    translateYOffset.flattenOffset();
    dragY.setValue(0);
    Animated.spring(translateYOffset, {
      velocity: velocityY,
      tension: 68,
      friction: 12,
      toValue: destSnapPoint,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const mainViewRef = useRef<View>(null);

  useEffect(() => {
    mainViewRef.current?.measure((_x, _y, _w, height) => {
      console.log('height:', height);
      if (height) {
        setScreenHeight(height - HEADER_HEIGHT);
      }
    });
  }, [mainViewRef]);

  const tapGesture = Gesture.Tap()
    .maxDuration(99999)
    .maxDeltaY(lastSnap - HEADER_HEIGHT);
  const panHeaderGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(tapGesture)
    .shouldCancelWhenOutside(false)
    .enableTrackpadTwoFingerGesture(true)
    .runOnJS(true)
    .onUpdate((event) => {
      dragY.setValue(event.translationY);
    })
    .onBegin(() => {
      lastScrollY.setValue(0);
    })
    .onStart(onHandlerStateChange);
  const panBodyGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(tapGesture)
    .shouldCancelWhenOutside(false)
    .enableTrackpadTwoFingerGesture(true)
    .runOnJS(true)
    .onUpdate((event) => {
      dragY.setValue(event.translationY);
    })
    .onStart(onHandlerStateChange);
  const scrollGesture = Gesture.Native()
    .simultaneousWithExternalGesture(panBodyGesture, panHeaderGesture)
    .requireExternalGestureToFail(tapGesture);

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        style={StyleSheet.absoluteFillObject}
        pointerEvents="box-none"
        ref={mainViewRef}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [{ translateY: translateY }],
            },
          ]}>
          <GestureDetector gesture={panHeaderGesture}>
            <Animated.View style={styles.header} />
          </GestureDetector>
          <GestureDetector gesture={panBodyGesture}>
            <Animated.View style={styles.container}>
              <GestureDetector gesture={scrollGesture}>
                <Animated.ScrollView
                  style={{ marginBottom: HEADER_HEIGHT }}
                  bounces={false}
                  onScrollBeginDrag={onRegisterLastScroll}
                  scrollEventThrottle={1}>
                  <LoremIpsum />
                  <LoremIpsum />
                  <LoremIpsum />
                </Animated.ScrollView>
              </GestureDetector>
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
export default function Example() {
  return (
    <View style={styles.container}>
      <BottomSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: 'red',
  },
});
