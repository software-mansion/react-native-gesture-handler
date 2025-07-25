import React from 'react';
import { NativeGesture } from './hooks/useGesture';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import GestureHandlerDetector from '../web/GestureHandlerDetector';
import { tagMessage } from '../utils';

// TODO: move it to a different file
export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

const AnimatedNativeDetector = Animated.createAnimatedComponent(
  GestureHandlerDetector
);

const ReanimatedNativeDetector = Reanimated?.default.createAnimatedComponent(
  // TODO: fix typing
  GestureHandlerDetector as any
);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const NativeDetectorComponent = gesture.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : gesture.shouldUseReanimated
      ? ReanimatedNativeDetector
      : GestureHandlerDetector;

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
