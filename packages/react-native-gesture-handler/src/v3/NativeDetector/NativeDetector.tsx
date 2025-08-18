import React from 'react';
import { NativeGesture, ComposedGesture, ComposedGestureType } from '../types';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../../utils';
import { isComposedGesture } from '../hooks/utils';
import { dfs } from './utils';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture | ComposedGesture;
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

  if (isComposedGesture(gesture)) {
    if (gesture.type === ComposedGestureType.Simultaneous) {
      dfs(gesture, new Set(gesture.tags));
    } else {
      dfs(gesture);
    }
  }

  return (
    <NativeDetectorComponent
      // @ts-ignore TODO: Fix types
      onGestureHandlerStateChange={
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
      onGestureHandlerAnimatedEvent={
        gesture.gestureEvents.onGestureHandlerAnimatedEvent
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerTouchEvent={
        gesture.gestureEvents.onGestureHandlerTouchEvent
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
