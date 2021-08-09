import React from 'react';
import { runOnJS, useEvent, useSharedValue } from 'react-native-reanimated';
import { useGesture } from 'react-native-gesture-handler';

export function useAnimatedGesture(gesture) {
  const result = useGesture(gesture);
  const shared = useSharedValue(null);

  const callback = (e) => {
    'worklet';

    for (let i = 0; i < shared.value.gestures.length; i++) {
      let gesture = shared.value.gestures[i];

      if (e.handlerTag == gesture.handlerTag) {
        if (e.oldState || e.oldState == 0) {
          if (e.oldState == 0 && e.state == 2) {
            gesture.config.onBegan?.(e);
          } else if (e.oldState == 2 && e.state == 4) {
            gesture.config.onStart?.(e);
          } else if (e.oldState == 4 && e.state == 5) {
            gesture.config.onEnd?.(e, true);
          } else if (e.state == 1) {
            gesture.config.onEnd?.(e, false);
          } else if (e.state == 3) {
            gesture.config.onEnd?.(e, false);
          }
        } else {
          gesture.config.onUpdate?.(e);
        }
      }
    }
  };

  const event = useEvent(
    callback,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    true
  );

  result.current[2] = event;
  result.current[3] = shared;

  return result;
}
