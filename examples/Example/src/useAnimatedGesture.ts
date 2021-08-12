import React from 'react';
import { useEvent, useSharedValue } from 'react-native-reanimated';
import {
  useGesture,
  State,
  GestureBuilder,
  SimpleGesture,
} from 'react-native-gesture-handler';

export function useAnimatedGesture(gesture: GestureBuilder | SimpleGesture) {
  const preparedGesture = useGesture(gesture);
  const sharedHandlersCallbacks = useSharedValue(null);

  const callback = (e) => {
    'worklet';

    for (let i = 0; i < sharedHandlersCallbacks.value.length; i++) {
      let gesture = sharedHandlersCallbacks.value[i];

      if (e.handlerTag === gesture.handlerTag) {
        if (e.oldState != null) {
          if (e.oldState === State.UNDETERMINED && e.state === State.BEGAN) {
            gesture.onBegan?.(e);
          } else if (
            (e.oldState === State.BEGAN || e.oldState === State.UNDETERMINED) &&
            e.state === 4
          ) {
            gesture.onStart?.(e);
          } else if (e.oldState === State.ACTIVE && e.state === State.END) {
            gesture.onEnd?.(e, true);
          } else if (e.state === State.FAILED) {
            gesture.onEnd?.(e, false);
          } else if (e.state === State.CANCELLED) {
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
