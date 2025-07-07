import React from 'react';
import RNGestureHandlerDetectorNativeComponent from './specs/RNGestureHandlerDetectorNativeComponent';
import { Animated, StyleSheet } from 'react-native';
import { NativeGesture } from './useGesture';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

const AnimatedDetector = Animated.createAnimatedComponent(
  RNGestureHandlerDetectorNativeComponent
);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  return (
    <AnimatedDetector
      onGestureHandlerStateChange={
        gesture.config.onGestureHandlerStateChange as any
      }
      onGestureHandlerEvent={gesture.config.onGestureHandlerEvent as any}
      onGestureHandlerAnimatedEvent={
        gesture.config.onGestureHandlerAnimatedEvent as any
      }
      onGestureHandlerTouchEvent={
        gesture.config.onGestureHandlerTouchEvent as any
      }
      animatedEvents={gesture.animatedEvents}
      // @ts-expect-error _RNGH_MODULE_ID is injected via JSI
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
