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
import { Platform } from 'react-native';

export function NativeDetector<THandlerData, TConfig>({
  gesture,
  children,
  touchAction,
  userSelect,
  enableContextMenu,
}: NativeDetectorProps<THandlerData, TConfig>) {
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : gesture.config.shouldUseReanimatedDetector
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  configureRelations(gesture);

  const handlerTags = useMemo(() => {
    return isComposedGesture(gesture)
      ? gesture.handlerTags
      : [gesture.handlerTag];
  }, [gesture]);

  // On web, we're triggering Reanimated callbacks ourselves, based on the type.
  // To handle this properly, we need to provide all three callbacks, so we set
  // all three to the Reanimated event handler.
  // On native, Reanimated handles routing internally based on the event names
  // passed to the useEvent hook. We only need to pass it once, so that Reanimated
  // can setup its internal listeners.
  const reanimatedHandlers =
    Platform.OS === 'web'
      ? {
          onGestureHandlerReanimatedEvent:
            gesture.detectorCallbacks.reanimatedEventHandler,
          onGestureHandlerReanimatedStateChange:
            gesture.detectorCallbacks.reanimatedEventHandler,
          onGestureHandlerReanimatedTouchEvent:
            gesture.detectorCallbacks.reanimatedEventHandler,
        }
      : {
          onGestureHandlerReanimatedEvent:
            gesture.detectorCallbacks.reanimatedEventHandler,
        };

  return (
    <NativeDetectorComponent
      touchAction={touchAction}
      userSelect={userSelect}
      enableContextMenu={enableContextMenu}
      pointerEvents={'box-none'}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerStateChange={
        gesture.detectorCallbacks.defaultEventHandler
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerEvent={gesture.detectorCallbacks.defaultEventHandler}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerTouchEvent={gesture.detectorCallbacks.defaultEventHandler}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedStateChange={
        reanimatedHandlers.onGestureHandlerReanimatedStateChange
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedEvent={
        reanimatedHandlers.onGestureHandlerReanimatedEvent
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedTouchEvent={
        reanimatedHandlers.onGestureHandlerReanimatedTouchEvent
      }
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerAnimatedEvent={
        gesture.detectorCallbacks.animatedEventHandler
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={handlerTags}
      style={nativeDetectorStyles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}
