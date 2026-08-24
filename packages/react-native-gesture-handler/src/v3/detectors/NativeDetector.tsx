import React, { useMemo } from 'react';
import { Platform } from 'react-native';

import { useJSResponderHandler } from '../hooks/useJSResponderHandler';
import { isComposedGesture } from '../hooks/utils/relationUtils';
import type { NativeDetectorProps } from './common';
import { AnimatedNativeDetector, nativeDetectorStyles } from './common';
import HostGestureDetector, {
  type RNGestureHandlerDetectorNativeComponentProps,
} from './HostGestureDetector';
import { ReanimatedNativeDetector } from './ReanimatedNativeDetector';
import { useDetectorAttachmentGuard } from './useDetectorAttachmentGuard';
import { useGestureRelationsUpdater } from './useGestureRelationsUpdater';
import { ensureNativeDetectorComponent } from './utils';

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
  const { handleStartShouldSetResponder } = useJSResponderHandler(gesture);

  const NativeDetectorComponent = (
    gesture.config.dispatchesAnimatedEvents
      ? AnimatedNativeDetector
      : gesture.config.shouldUseReanimatedDetector
        ? ReanimatedNativeDetector
        : HostGestureDetector
  ) as React.FunctionComponent<RNGestureHandlerDetectorNativeComponentProps>;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  useGestureRelationsUpdater(gesture);

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
  //
  // `reanimatedEventHandler` is built whenever `disableReanimated` is unset, but
  // `shouldUseReanimatedDetector` additionally requires worklet callbacks. When it is false we
  // render the plain host component, which forwards props verbatim, so passing the handler would
  // put a non-function on a codegen `DirectEventHandler` prop.
  const reanimatedEventHandler = gesture.config.shouldUseReanimatedDetector
    ? gesture.detectorCallbacks.reanimatedEventHandler
    : undefined;

  const reanimatedHandlers =
    Platform.OS === 'web'
      ? {
          onGestureHandlerReanimatedEvent: reanimatedEventHandler,
          onGestureHandlerReanimatedStateChange: reanimatedEventHandler,
          onGestureHandlerReanimatedTouchEvent: reanimatedEventHandler,
        }
      : {
          onGestureHandlerReanimatedEvent: reanimatedEventHandler,
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
      style={nativeDetectorStyles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}
