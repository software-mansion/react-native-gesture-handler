import React from 'react';
import RNGestureHandlerDetectorNativeComponent from '../../specs/RNGestureHandlerDetectorNativeComponent';
import { Animated, StyleSheet } from 'react-native';
import { NativeGesture } from '../hooks/useGesture';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

const AnimatedDetector = Animated.createAnimatedComponent(
  RNGestureHandlerDetectorNativeComponent
);

export function AnimatedNativeDetector({
  gesture,
  children,
}: NativeDetectorProps) {
  console.log('Hello from AnimatedNativeDetector');
  console.log(gesture.gestureEvents.onGestureHandlerStateChange);

  return (
    <AnimatedDetector
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
    </AnimatedDetector>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
