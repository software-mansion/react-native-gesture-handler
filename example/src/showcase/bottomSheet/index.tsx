import React, {
  Component,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  PanGestureHandler,
  NativeViewGestureHandler,
  State,
  TapGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  Gesture,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../../common';
import { USE_NATIVE_DRIVER } from '../../config';

const HEADER_HEIGHT = 50;

export function BottomSheet() {
  let lastScrollYValue: number;
  let lastScrollY: Animated.Value;
  let dragY: Animated.Value;
  let reverseLastScrollY: Animated.AnimatedMultiplication<number>;
  let translateYOffset: Animated.Value;
  let translateY: Animated.AnimatedInterpolation<number>;

  const [screenHeight, setScreenHeight] = useState(HEADER_HEIGHT / 0.4 + 1);

  let onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  let onRegisterLastScroll: (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => void;

  console.log('screenHeight:', screenHeight);
  const snapPoints = [HEADER_HEIGHT, screenHeight * 0.4, screenHeight * 0.8];

  const masterdrawer = useRef<TapGestureHandler>(null);
  const drawer = useRef<PanGestureHandler>(null);
  const drawerheader = useRef<PanGestureHandler>(null);
  const scroll = useRef<NativeViewGestureHandler>(null);

  const startSnapPoint = snapPoints[0];
  const endSnapPoint = snapPoints[snapPoints.length - 1];

  const [lastSnap, setLastSnap] = useState(endSnapPoint);

  lastScrollYValue = 0;
  lastScrollY = new Animated.Value(0);
  onRegisterLastScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: lastScrollY } } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );
  lastScrollY.addListener(({ value }) => {
    lastScrollYValue = value;
  });

  dragY = new Animated.Value(0);
  onGestureEvent = Animated.event([{ nativeEvent: { translationY: dragY } }], {
    useNativeDriver: USE_NATIVE_DRIVER,
  });

  reverseLastScrollY = Animated.multiply(new Animated.Value(-1), lastScrollY);

  translateYOffset = new Animated.Value(endSnapPoint);
  translateY = Animated.add(
    translateYOffset,
    Animated.add(dragY, reverseLastScrollY)
  ).interpolate({
    inputRange: [startSnapPoint, endSnapPoint],
    outputRange: [startSnapPoint, endSnapPoint],
    extrapolate: 'clamp',
  });

  const onHeaderHandlerStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.BEGAN) {
      lastScrollY.setValue(0);
    }
    onHandlerStateChange({ nativeEvent });
  };
  const onHandlerStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      let { velocityY, translationY } = nativeEvent;
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
    }
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

  return (
    <TapGestureHandler
      maxDurationMs={100000}
      ref={masterdrawer}
      maxDeltaY={lastSnap - snapPoints[0]}>
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
          <PanGestureHandler
            ref={drawerheader}
            simultaneousHandlers={[scroll, masterdrawer]}
            shouldCancelWhenOutside={false}
            enableTrackpadTwoFingerGesture
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHeaderHandlerStateChange}>
            <Animated.View style={styles.header} />
          </PanGestureHandler>
          <PanGestureHandler
            ref={drawer}
            simultaneousHandlers={[scroll, masterdrawer]}
            shouldCancelWhenOutside={false}
            onGestureEvent={onGestureEvent}
            enableTrackpadTwoFingerGesture
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View style={styles.container}>
              <NativeViewGestureHandler
                ref={scroll}
                waitFor={masterdrawer}
                simultaneousHandlers={drawer}>
                <Animated.ScrollView
                  style={{ marginBottom: snapPoints[0] }}
                  bounces={false}
                  onScrollBeginDrag={onRegisterLastScroll}
                  scrollEventThrottle={1}>
                  <LoremIpsum />
                  <LoremIpsum />
                  <LoremIpsum />
                </Animated.ScrollView>
              </NativeViewGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </View>
    </TapGestureHandler>
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
