import { use, useCallback, useEffect, useRef, useState } from 'react';

import { Worklets } from '../../handlers/gestures/reanimatedWrapper';
import {
  JSResponderContext,
  updateResponderEventValue,
} from '../scrollViewInterop';
import { type Gesture, type SharedValue, SingleGestureName } from '../types';
import { isComposedGesture, maybeUnpackValue } from './utils';
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
  countNativeAsHandled: boolean
): boolean {
  if (isComposedGesture(gesture)) {
    return gesture.gestures.some((child) =>
      isSupportedGesture(child, countNativeAsHandled)
    );
  }

  if (maybeUnpackValue(gesture.config.enabled) === false) {
    return false;
  }

  switch (gesture.type) {
    case SingleGestureName.Tap:
    case SingleGestureName.LongPress:
    case SingleGestureName.Fling:
    case SingleGestureName.Hover:
      return true;
    case SingleGestureName.Native:
      return (
        countNativeAsHandled && gesture.config.countNativeAsHandled !== false
      );
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
  // Whether a tap on a Native gesture counts as handled. Scrollers and other
  // non-tap-targets turn it off so touching them doesn't keep the keyboard open.
  countNativeAsHandled = true
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
      gesture !== undefined && isSupportedGesture(gesture, countNativeAsHandled)
    );
  }, [enabledSharedValueRevision, gesture, countNativeAsHandled]);

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
