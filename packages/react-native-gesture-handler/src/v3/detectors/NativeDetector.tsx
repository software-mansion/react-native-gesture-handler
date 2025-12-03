import React, { useMemo } from 'react';
import HostGestureDetector from './HostGestureDetector';
import { configureRelations, ensureNativeDetectorComponent } from './utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';
import {
  AnimatedNativeDetector,
  NativeDetectorProps,
  nativeDetectorStyles,
} from './common';
import { ReanimatedNativeDetector } from './ReanimatedNativeDetector';

export function NativeDetector<THandlerData, TConfig>({
  gesture,
  children,
}: NativeDetectorProps<THandlerData, TConfig>) {
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : gesture.config.shouldUseReanimatedDetector
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  configureRelations(gesture);

  const handlerTags = useMemo(() => {
    return isComposedGesture(gesture) ? gesture.tags : [gesture.tag];
  }, [gesture]);

  return (
    <NativeDetectorComponent
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
      onGestureHandlerReanimatedStateChange={
        gesture.detectorCallbacks.onReanimatedStateChange
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedEvent={
        gesture.detectorCallbacks.onReanimatedUpdateEvent
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedTouchEvent={
        gesture.detectorCallbacks.onReanimatedTouchEvent
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
