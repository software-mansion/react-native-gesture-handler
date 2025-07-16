import React from 'react';
import { NativeGesture } from './hooks/useGesture';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import RNGestureHandlerDetectorNativeComponent from '../specs/RNGestureHandlerDetectorNativeComponent';

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
  const NativeDetectorComponent = gesture.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : Reanimated !== undefined && gesture.shouldUseReanimated
      ? ReanimatedNativeDetector!
      : RNGestureHandlerDetectorNativeComponent;

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
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      dispatchesAnimatedEvents={gesture.dispatchesAnimatedEvents}
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={[gesture.tag]}
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
