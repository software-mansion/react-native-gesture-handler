import React from 'react';
import { NativeGesture, ComposedGesture } from '../types';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../../utils';
import { configureRelations } from './utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture<unknown, unknown> | ComposedGesture;
}

const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  // It might happen only with ReanimatedNativeDetector
  if (!NativeDetectorComponent) {
    throw new Error(
      tagMessage(
        'Gesture expects to run on the UI thread, but failed to create the Reanimated NativeDetector.'
      )
    );
  }

  configureRelations(gesture);

  return (
    <NativeDetectorComponent
      // @ts-ignore TODO: Fix types
      onGestureHandlerStateChange={
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
      // @ts-ignore TODO: Fix types
      onGestureHandlerTouchEvent={
        gesture.gestureEvents.onGestureHandlerTouchEvent
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerReanimatedStateChange={
        gesture.gestureEvents.onReanimatedStateChange
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerReanimatedEvent={
        gesture.gestureEvents.onReanimatedUpdateEvent
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerReanimatedTouchEvent={
        gesture.gestureEvents.onReanimatedTouchEvent
      }
      onGestureHandlerAnimatedEvent={
        gesture.gestureEvents.onGestureHandlerAnimatedEvent
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={isComposedGesture(gesture) ? gesture.tags : [gesture.tag]}
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
