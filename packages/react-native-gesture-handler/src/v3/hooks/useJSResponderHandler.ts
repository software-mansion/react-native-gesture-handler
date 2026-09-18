import { use, useCallback, useEffect, useRef, useState } from 'react';

import { Worklets } from '../../handlers/gestures/reanimatedWrapper';
import {
  JSResponderContext,
  updateResponderEventValue,
} from '../scrollViewInterop';
import { type Gesture, type SharedValue, SingleGestureName } from '../types';
import { isComposedGesture, isGestureEnabled } from './utils';
import {
  getEnabledSharedValues,
  SHARED_VALUE_OFFSET,
} from './utils/reanimatedUtils';

// adding 0.5 to not call Math.random and to make sure that listener ID is not an integer to avoid conflicts
let nextJSResponderContextListenerId = SHARED_VALUE_OFFSET + 0.5;

function isSupportedGesture<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>,
  allowNative: boolean
): boolean {
  if (isComposedGesture(gesture)) {
    return gesture.gestures.some((child) =>
      isSupportedGesture(child, allowNative)
    );
  }

  switch (gesture.type) {
    case SingleGestureName.Tap:
    case SingleGestureName.LongPress:
    case SingleGestureName.Fling:
    case SingleGestureName.Hover:
      return true;
    case SingleGestureName.Native:
      return allowNative;
    default:
      return false;
  }
}

export function useJSResponderHandler<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData> | undefined,
  // Whether a Native gesture counts as handling the tap. True for buttons and
  // other wrapped controls. InterceptingGestureDetector passes false, since
  // ScrollView and FlatList are intercepting detectors with a Native gesture
  // and a touch on a scroller should not keep the keyboard open.
  allowNative = true
) {
  const jsResponderContext = use(JSResponderContext);
  const [enabledSharedValueRevision, setEnabledSharedValueRevision] =
    useState(0);
  const listenerIdRef = useRef<number | null>(null);

  if (listenerIdRef.current === null) {
    listenerIdRef.current = nextJSResponderContextListenerId++;
  }

  useEffect(() => {
    if (gesture === undefined) {
      return;
    }

    const enabledSharedValues = getEnabledSharedValues(gesture);

    if (Worklets === undefined || enabledSharedValues.length === 0) {
      return;
    }

    const listenerId = listenerIdRef.current;
    if (listenerId === null) {
      return;
    }

    const { scheduleOnUI, scheduleOnRN } = Worklets;

    const notifyEnabledChanged = () => {
      setEnabledSharedValueRevision((revision) => revision + 1);
    };

    const attachListeners = (
      sharedValues: SharedValue<boolean>[],
      id: number,
      notify: () => void
    ) => {
      'worklet';
      const listener = () => {
        scheduleOnRN(notify);
      };

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

    scheduleOnUI(
      attachListeners,
      enabledSharedValues,
      listenerId,
      notifyEnabledChanged
    );

    return () => {
      scheduleOnUI(detachListeners, enabledSharedValues, listenerId);
    };
  }, [gesture]);

  const shouldHandleJSResponderEvent = useCallback(() => {
    void enabledSharedValueRevision;
    return (
      gesture !== undefined &&
      isGestureEnabled(gesture) &&
      isSupportedGesture(gesture, allowNative)
    );
  }, [enabledSharedValueRevision, gesture, allowNative]);

  const handleStartShouldSetResponder = useCallback(() => {
    if (shouldHandleJSResponderEvent()) {
      updateResponderEventValue(jsResponderContext, true);
    }

    return false;
  }, [jsResponderContext, shouldHandleJSResponderEvent]);

  return {
    handleStartShouldSetResponder:
      jsResponderContext == null ? () => false : handleStartShouldSetResponder,
  };
}
