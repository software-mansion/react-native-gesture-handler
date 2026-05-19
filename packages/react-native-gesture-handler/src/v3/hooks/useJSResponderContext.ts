import { use, useCallback } from 'react';

import { JSResponderContext } from '../components/ScrollViewResponderInterceptor';
import { type Gesture, SingleGestureName } from '../types';
import { isComposedGesture, maybeUnpackValue } from './utils';

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

export function useJSResponderContext<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>) {
  const jsResponderContext = use(JSResponderContext);

  const shouldHandleJSResponderEvent = useCallback(() => {
    return isGestureEnabled(gesture) && isSupportedGesture(gesture);
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

  return {
    handleStartShouldSetResponder:
      jsResponderContext == null ? () => false : handleStartShouldSetResponder,
  };
}
