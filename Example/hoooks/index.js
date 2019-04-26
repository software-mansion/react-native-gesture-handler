import React, { Component, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  usePan,
  usePinch,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum } from '../common';

const onGestureEvent = (translateX, translateY) =>
  Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { USE_NATIVE_DRIVER: USE_NATIVE_DRIVER }
  );

const onHandlerStateChange = ({
  translateX,
  translateY,
  lastOffset,
}) => event => {
  if (event.nativeEvent.oldState === State.ACTIVE) {
    lastOffset.x += event.nativeEvent.translationX;
    lastOffset.y += event.nativeEvent.translationY;
    translateX.setOffset(lastOffset.x);
    translateX.setValue(0);
    translateY.setOffset(lastOffset.y);
    translateY.setValue(0);
  }
};

const onPinchGestureEvent = pinchScale =>
  Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: USE_NATIVE_DRIVER,
  });

const onPinchHandlerStateChange = ({
  lastScale,
  baseScale,
  pinchScale,
}) => event => {
  if (event.nativeEvent.oldState === State.ACTIVE) {
    lastScale *= event.nativeEvent.scale;
    baseScale.setValue(lastScale);
    pinchScale.setValue(1);
  }
};

export default function hooksExample() {
  const [
    {
      translateX,
      translateY,
      lastOffset,
      lastScale,
      baseScale,
      pinchScale,
      panRef,
      pinchRef,
    },
  ] = useState({
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    lastOffset: { x: 0, y: 0 },
    lastScale: 1,
    baseScale: new Animated.Value(1),
    pinchScale: new Animated.Value(1),
    panRef: React.createRef(),
    pinchRef: React.createRef(),
  });

  const [
    {
      _onGestureEvent,
      _onHandlerStateChange,
      _onPinchHandlerStateChange,
      _onPinchGestureEvent,
    },
  ] = useState({
    _onGestureEvent: onGestureEvent(translateX, translateY),
    _onHandlerStateChange: onHandlerStateChange({
      translateX,
      translateY,
      lastOffset,
    }),
    _onPinchHandlerStateChange: onPinchHandlerStateChange({
      lastScale,
      pinchScale,
      baseScale,
    }),
    _onPinchGestureEvent: onPinchGestureEvent(pinchScale),
  });

  const pan = usePan({
    handlerRef: panRef,
    onGestureEvent: _onGestureEvent,
    onHandlerStateChange: _onHandlerStateChange,
    simultaneousHandlers: pinchRef,
  });

  const pinch = usePinch({
    handlerRef: pinchRef,
    onGestureEvent: _onPinchGestureEvent,
    onHandlerStateChange: _onPinchHandlerStateChange,
    simultaneousHandlers: panRef,
  });

  return (
    <Animated.View {...pinch}>
      <Animated.View
        {...pan}
        style={[
          styles.box,
          {
            transform: [
              { translateX: translateX },
              { translateY: translateY },
              { scale: Animated.multiply(baseScale, pinchScale) },
            ],
          },
          styles.boxStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
  },
});
