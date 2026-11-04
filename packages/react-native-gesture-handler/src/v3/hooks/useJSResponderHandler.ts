import { use, useCallback } from 'react';

import {
  JSResponderContext,
  updateResponderEventValue,
} from '../scrollViewInterop';
import { type Gesture, SingleGestureName } from '../types';
import { isComposedGesture, maybeUnpackValue } from './utils';

const ignoreResponderEvent = () => false;

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

  // `enabled` is read when the touch starts, so a SharedValue is always current
  const handleStartShouldSetResponder = useCallback(() => {
    if (
      gesture !== undefined &&
      isSupportedGesture(gesture, countNativeAsHandled)
    ) {
      updateResponderEventValue(jsResponderContext, true);
    }

    return false;
  }, [jsResponderContext, gesture, countNativeAsHandled]);

  return {
    handleStartShouldSetResponder:
      jsResponderContext == null
        ? ignoreResponderEvent
        : handleStartShouldSetResponder,
  };
}
