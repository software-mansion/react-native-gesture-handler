import React from 'react';
import { runOnJS, useEvent, useSharedValue } from 'react-native-reanimated';
import { useGesture } from 'react-native-gesture-handler';

export function useAnimatedGesture(gesture) {
  const preparedGesture = useGesture(gesture);
  const sharedHandlersCallbacks = useSharedValue(null);

  const callback = (e) => {
    'worklet';

    for (let i = 0; i < sharedHandlersCallbacks.value.length; i++) {
      let gesture = sharedHandlersCallbacks.value[i];

      if (e.handlerTag == gesture.handlerTag) {
        if (e.oldState != null) {
          if (e.oldState == 0 && e.state == 2) {
            gesture.onBegan?.(e);
          } else if ((e.oldState == 2 || e.oldState == 0) && e.state == 4) {
            gesture.onStart?.(e);
          } else if (e.oldState == 4 && e.state == 5) {
            gesture.onEnd?.(e, true);
          } else if (e.state == 1) {
            gesture.onEnd?.(e, false);
          } else if (e.state == 3) {
            gesture.onEnd?.(e, false);
          }
        } else {
          gesture.onUpdate?.(e);
        }
      }
    }
  };

  const event = useEvent(
    callback,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    true
  );

  preparedGesture.current.animatedEventHandler = event;
  preparedGesture.current.animatedHandlers = sharedHandlersCallbacks;

  return preparedGesture;
}
