import React from 'react';
import RNGestureHandlerDetectorNativeComponent from '../../specs/RNGestureHandlerDetectorNativeComponent';
import { StyleSheet } from 'react-native';
import { NativeGesture } from '../hooks/useGesture';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

export function BasicNativeDetector({
  gesture,
  children,
}: NativeDetectorProps) {
  console.log('Hello from SimpleNativeDetector');
  return (
    <RNGestureHandlerDetectorNativeComponent
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
      dispatchesAnimatedEvents={false}
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={[gesture.tag]}
      style={styles.detector}>
      {children}
    </RNGestureHandlerDetectorNativeComponent>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
