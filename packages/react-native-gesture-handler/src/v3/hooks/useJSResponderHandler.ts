import { use, useCallback, useEffect, useRef, useState } from 'react';

import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { JSResponderContext } from '../components/ScrollViewResponderInterceptor';
import { type Gesture, type SharedValue, SingleGestureName } from '../types';
import { isComposedGesture, isGestureEnabled } from './utils';
import { SHARED_VALUE_OFFSET } from './utils/reanimatedUtils';

// adding 0.5 to not call Math.random and to make sure that listener ID is not an integer to avoid conflicts
let nextJSResponderContextListenerId = SHARED_VALUE_OFFSET + 0.5;

function isSupportedGesture<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>): boolean {
  if (isComposedGesture(gesture)) {
    return gesture.gestures.some(isSupportedGesture);
  }

  switch (gesture.type) {
    case SingleGestureName.Tap:
    case SingleGestureName.LongPress:
    case SingleGestureName.Fling:
    case SingleGestureName.Native:
    case SingleGestureName.Hover:
      return true;
    default:
      return false;
  }
}

function getEnabledSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>
): SharedValue<boolean>[] {
  if (Reanimated === undefined) {
    return [];
  }

  if (isComposedGesture(gesture)) {
    return gesture.gestures.flatMap(getEnabledSharedValues);
  }

  const enabled = gesture.config.enabled;
  return Reanimated.isSharedValue<boolean>(enabled) ? [enabled] : [];
}

export function useJSResponderHandler<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>) {
  const jsResponderContext = use(JSResponderContext);
  const [enabledSharedValueRevision, setEnabledSharedValueRevision] =
    useState(0);
  const listenerIdRef = useRef<number | null>(null);

  if (listenerIdRef.current === null) {
    listenerIdRef.current = nextJSResponderContextListenerId++;
  }

  useEffect(() => {
    const reanimated = Reanimated;
    const enabledSharedValues = getEnabledSharedValues(gesture);

    if (reanimated === undefined || enabledSharedValues.length === 0) {
      return;
    }

    const listenerId = listenerIdRef.current;
    if (listenerId === null) {
      return;
    }

    const notifyEnabledChanged = reanimated.runOnJS(() => {
      setEnabledSharedValueRevision((revision) => revision + 1);
    });

    const attachListeners = (
      sharedValues: SharedValue<boolean>[],
      id: number,
      listener: () => void
    ) => {
      'worklet';
      for (const sharedValue of sharedValues) {
        sharedValue.addListener(id, listener);
      }
    };

    const detachListeners = (
      sharedValues: SharedValue<boolean>[],
      id: number
    ) => {
      'worklet';
      for (const sharedValue of sharedValues) {
        sharedValue.removeListener(id);
      }
    };

    reanimated.runOnUI(attachListeners)(
      enabledSharedValues,
      listenerId,
      notifyEnabledChanged
    );

    return () => {
      reanimated.runOnUI(detachListeners)(enabledSharedValues, listenerId);
    };
  }, [gesture]);

  const shouldHandleJSResponderEvent = useCallback(() => {
    void enabledSharedValueRevision;
    return isGestureEnabled(gesture) && isSupportedGesture(gesture);
  }, [enabledSharedValueRevision, gesture]);

  const handleStartShouldSetResponder = useCallback(() => {
    if (shouldHandleJSResponderEvent()) {
      const responderEventRef = jsResponderContext?.isRNGHResponderEvent;

      if (responderEventRef) {
        responderEventRef.current = true;
      }
    }

    return false;
  }, [jsResponderContext, shouldHandleJSResponderEvent]);

  return {
    handleStartShouldSetResponder:
      jsResponderContext == null ? () => false : handleStartShouldSetResponder,
  };
}
