import React from 'react';
import { NativeGesture } from './types';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import RNGestureHandlerDetectorNativeComponent from '../specs/RNGestureHandlerDetectorNativeComponent';
import { tagMessage } from '../utils';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

const AnimatedNativeDetector = Animated.createAnimatedComponent(
  RNGestureHandlerDetectorNativeComponent
);

const ReanimatedNativeDetector = Reanimated?.default.createAnimatedComponent(
  RNGestureHandlerDetectorNativeComponent
);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : RNGestureHandlerDetectorNativeComponent;

  // It might happen only with ReanimatedNativeDetector
  if (!NativeDetectorComponent) {
    throw new Error(
      tagMessage(
        'Gesture expects to run on the UI thread, but failed to create the Reanimated NativeDetector.'
      )
    );
  }

  return (
    <NativeDetectorComponent
      onGestureHandlerStateChange={
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
      onGestureHandlerAnimatedEvent={
        gesture.gestureEvents.onGestureHandlerAnimatedEvent
      }
      onGestureHandlerTouchEvent={
        gesture.gestureEvents.onGestureHandlerTouchEvent
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={gesture.tag}
      style={styles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
