import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../../common';
import Animated, {
  clamp,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 50;

export function BottomSheet() {
  const [screenHeight, setScreenHeight] = useState(HEADER_HEIGHT / 0.4 + 1);

  const snapPoints = [HEADER_HEIGHT, screenHeight * 0.4, screenHeight * 0.8];

  const startSnapPoint = snapPoints[0];
  const endSnapPoint = snapPoints[snapPoints.length - 1];

  const [lastSnap, setLastSnap] = useState(endSnapPoint);

  const lastScrollY = useSharedValue(0);
  const dragY = useSharedValue(0);
  const reversedLastScrollY = useDerivedValue(() => lastScrollY.value * -1);

  const translateYOffset = useSharedValue(endSnapPoint);
  const translateYSource = useDerivedValue(
    () => translateYOffset.value + dragY.value + reversedLastScrollY.value
  );

  const onHandlerStateChange = (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    'worklet';
    const { velocityY, translationY } = event;

    const dragToss = 0.05;
    const endOffsetY =
      lastSnap + translationY - lastScrollY.value + dragToss * velocityY;

    let destSnapPoint = snapPoints[0];
    for (const snapPoint of snapPoints) {
      const distFromSnap = Math.abs(snapPoint - endOffsetY);
      if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
        destSnapPoint = snapPoint;
      }
    }

    dragY.value = 0;

    translateYOffset.value = withSpring(destSnapPoint);

    runOnJS(setLastSnap)(destSnapPoint);
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
    .onUpdate((event) => {
      'worklet';
      dragY.value = event.translationY;
    })
    .onBegin(() => {
      'worklet';
      lastScrollY.value = 0;
    })
    .onStart(onHandlerStateChange);
  const panBodyGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(tapGesture)
    .shouldCancelWhenOutside(false)
    .enableTrackpadTwoFingerGesture(true)
    .onUpdate((event) => {
      'worklet';
      dragY.value = event.translationY;
    })
    .onStart(onHandlerStateChange);
  const scrollGesture = Gesture.Native()
    .simultaneousWithExternalGesture(panBodyGesture, panHeaderGesture)
    .requireExternalGestureToFail(tapGesture);

  const translateY = useDerivedValue(() =>
    clamp(translateYSource.value, startSnapPoint, endSnapPoint)
  );
  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
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
            <View style={styles.header} />
          </GestureDetector>
          <GestureDetector gesture={panBodyGesture}>
            <Animated.View style={styles.container}>
              <GestureDetector gesture={scrollGesture}>
                <Animated.ScrollView style={{ marginBottom: HEADER_HEIGHT }}>
                  <LoremIpsum words={500} />
                  <LoremIpsum words={500} />
                </Animated.ScrollView>
              </GestureDetector>
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </Animated.View>
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
