import React, { use, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

import { maybeUnpackValue } from '../hooks/utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';
import { JSResponderContext } from '../JSResponderContext';
import type { Gesture } from '../types';
import type { NativeDetectorProps } from './common';
import { AnimatedNativeDetector, nativeDetectorStyles } from './common';
import HostGestureDetector from './HostGestureDetector';
import { ReanimatedNativeDetector } from './ReanimatedNativeDetector';
import { configureRelations, ensureNativeDetectorComponent } from './utils';

function isGestureEnabled<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>): boolean {
  if (isComposedGesture(gesture)) {
    // For composed gestures, we need to check if at least one of the composed gestures is enabled
    return gesture.gestures.some(isGestureEnabled);
  }

  return maybeUnpackValue(gesture.config.enabled) !== false;
}

export function NativeDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>({
  gesture,
  children,
  touchAction,
  userSelect,
  enableContextMenu,
}: NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>) {
  const jsResponderContext = use(JSResponderContext);

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

  const shouldHandleJSResponderEvent = useCallback(() => {
    return isGestureEnabled(gesture);
  }, [gesture]);

  const handleStartShouldSetResponder = useCallback(() => {
    if (shouldHandleJSResponderEvent()) {
      const responderEventRef = jsResponderContext?.isRNGHResponderEvent;

      if (responderEventRef) {
        responderEventRef.current = true;
      }
    }

    return false;
  }, [jsResponderContext, shouldHandleJSResponderEvent]);

  return (
    <NativeDetectorComponent
      onStartShouldSetResponder={handleStartShouldSetResponder}
      touchAction={touchAction}
      userSelect={userSelect}
      enableContextMenu={enableContextMenu}
      pointerEvents={'box-none'}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerStateChange={gesture.detectorCallbacks.jsEventHandler}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerEvent={gesture.detectorCallbacks.jsEventHandler}
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerTouchEvent={gesture.detectorCallbacks.jsEventHandler}
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
