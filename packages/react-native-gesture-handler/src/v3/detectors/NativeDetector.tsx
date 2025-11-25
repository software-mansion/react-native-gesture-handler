import React, { useMemo } from 'react';
import HostGestureDetector from './HostGestureDetector';
import { configureRelations, ensureNativeDetectorComponent } from './utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';
import {
  AnimatedNativeDetector,
  NativeDetectorProps,
  nativeDetectorStyles,
} from './common';
import { useReanimatedEventsManager } from './useReanimatedEventsManager';

export function NativeDetector<THandlerData, TConfig>({
  gesture,
  children,
}: NativeDetectorProps<THandlerData, TConfig>) {
  // TODO: is it possible with useReanimatedEventsManager to handle both Animated and Reanimated at the same time?

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : HostGestureDetector;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  configureRelations(gesture);

  // TODO: call useReanimatedEventsManager only when using Reanimated
  const viewRef = useReanimatedEventsManager(gesture);
  const handlerTags = useMemo(() => {
    return isComposedGesture(gesture) ? gesture.tags : [gesture.tag];
  }, [gesture]);

  return (
    <NativeDetectorComponent
      ref={viewRef}
      pointerEvents={'box-none'}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerStateChange={
        gesture.detectorCallbacks.onGestureHandlerStateChange
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerEvent={gesture.detectorCallbacks.onGestureHandlerEvent}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerTouchEvent={
        gesture.detectorCallbacks.onGestureHandlerTouchEvent
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerAnimatedEvent={
        gesture.detectorCallbacks.onGestureHandlerAnimatedEvent
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={handlerTags}
      style={nativeDetectorStyles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}
