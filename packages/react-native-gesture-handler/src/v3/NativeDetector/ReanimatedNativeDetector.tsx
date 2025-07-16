import React from 'react';
import RNGestureHandlerDetectorNativeComponent from '../../specs/RNGestureHandlerDetectorNativeComponent';
import { StyleSheet } from 'react-native';
import { NativeGesture } from '../hooks/useGesture';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

const ReanimatedDetector = Reanimated?.default.createAnimatedComponent(
  RNGestureHandlerDetectorNativeComponent
);

export function ReanimatedNativeDetector({
  gesture,
  children,
}: NativeDetectorProps) {
  console.log('Hello from ReanimatedNativeDetector');
  return (
    <ReanimatedDetector
      onGestureHandlerStateChange={
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
      onGestureHandlerTouchEvent={
        gesture.gestureEvents.onGestureHandlerTouchEvent
      }
      onGestureHandlerAnimatedEvent={
        gesture.gestureEvents.onGestureHandlerAnimatedEvent
      }
      dispatchesAnimatedEvents={false}
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={[gesture.tag]}
      style={styles.detector}>
      {children}
    </ReanimatedDetector>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
