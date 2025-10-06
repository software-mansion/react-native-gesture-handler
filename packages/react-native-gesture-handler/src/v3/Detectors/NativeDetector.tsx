import React from 'react';
import HostGestureDetector from './HostGestureDetector';
import { configureRelations, ensureNativeDetectorComponent } from './utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';
import {
  AnimatedNativeDetector,
  NativeDetectorProps,
  nativeDetectorStyles,
  ReanimatedNativeDetector,
} from './common';

export function NativeDetector<THandlerData, TConfig>({
  gesture,
  children,
}: NativeDetectorProps<THandlerData, TConfig>) {
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : gesture.config.shouldUseReanimated
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  configureRelations(gesture);

  return (
    <NativeDetectorComponent
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerStateChange={
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerTouchEvent={
        gesture.gestureEvents.onGestureHandlerTouchEvent
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedStateChange={
        gesture.gestureEvents.onReanimatedStateChange
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedEvent={
        gesture.gestureEvents.onReanimatedUpdateEvent
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedTouchEvent={
        gesture.gestureEvents.onReanimatedTouchEvent
      }
      onGestureHandlerAnimatedEvent={
        gesture.gestureEvents.onGestureHandlerAnimatedEvent
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={isComposedGesture(gesture) ? gesture.tags : [gesture.tag]}
      style={nativeDetectorStyles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}
