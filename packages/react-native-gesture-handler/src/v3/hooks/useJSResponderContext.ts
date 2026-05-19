import { use, useCallback } from 'react';

import { JSResponderContext } from '../components/ScrollViewResponderInterceptor';
import type { Gesture } from '../types';
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

export function useJSResponderContext<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>) {
  const jsResponderContext = use(JSResponderContext);

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

  return {
    handleStartShouldSetResponder:
      jsResponderContext == null ? () => false : handleStartShouldSetResponder,
  };
}
