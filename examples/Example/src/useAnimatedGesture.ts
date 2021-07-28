import React from 'react';
import { runOnJS, useEvent } from 'react-native-reanimated';
import { useGesture } from 'react-native-gesture-handler';

export function useAnimatedGesture(gesture) {
  const result = useGesture(gesture);

  const callback = (e) => {
    for (const gesture of result.current.gestures) {
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

  const handler = (event) => {
    'worklet';

    runOnJS(callback)(event);
  };

  const event = useEvent(
    handler,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    false
  );

  return { gesture: result, event: event };
}
