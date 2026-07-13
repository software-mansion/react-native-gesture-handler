import React, { useMemo } from 'react';

import { useJSResponderHandler } from '../hooks/useJSResponderHandler';
import { isComposedGesture } from '../hooks/utils/relationUtils';
import type { CoreRuntime } from '../platform/Port';
import type { NativeDetectorProps } from './common';
import { useDetectorAttachmentGuard } from './useDetectorAttachmentGuard';
import { useGestureRelationsUpdater } from './useGestureRelationsUpdater';
import { ensureNativeDetectorComponent } from './utils';

export function NativeDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  runtime: CoreRuntime,
  props: NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
) {
  const { gesture, children, touchAction, userSelect, enableContextMenu } =
    props;
  const { handleStartShouldSetResponder } = useJSResponderHandler(
    runtime,
    gesture
  );

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? runtime.port.detector.AnimatedHostGestureDetector
    : gesture.config.shouldUseReanimatedDetector
      ? runtime.port.detector.ReanimatedHostGestureDetector
      : runtime.port.detector.HostGestureDetector;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  useGestureRelationsUpdater(runtime, gesture);

  const handlerTags = useMemo(() => {
    return isComposedGesture(gesture)
      ? gesture.handlerTags
      : [gesture.handlerTag];
  }, [gesture]);

  useDetectorAttachmentGuard(handlerTags);

  // On web, we're triggering Reanimated callbacks ourselves, based on the type.
  // To handle this properly, we need to provide all three callbacks, so we set
  // all three to the Reanimated event handler.
  // On native, Reanimated handles routing internally based on the event names
  // passed to the useEvent hook. We only need to pass it once, so that Reanimated
  // can setup its internal listeners.
  const reanimatedHandlers = runtime.port.capabilities.fansOutReanimatedHandlers
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
      style={runtime.port.detector.detectorStyle}>
      {children}
    </NativeDetectorComponent>
  );
}
