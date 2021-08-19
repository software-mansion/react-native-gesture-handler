import { useEvent, useSharedValue } from 'react-native-reanimated';
import { useGesture } from './useGesture';
import { State } from '../../State';
import { InteractionBuilder, GestureType, HandlerCallbacks } from './gesture';
import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';

export function useAnimatedGesture(gesture: InteractionBuilder | GestureType) {
  const preparedGesture = useGesture(gesture);
  const sharedHandlersCallbacks = useSharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  >(null);

  const callback = (
    event:
      | UnwrappedGestureHandlerStateChangeEvent
      | UnwrappedGestureHandlerEvent
  ) => {
    'worklet';

    const currentCallback = sharedHandlersCallbacks.value;
    if (!currentCallback) {
      return;
    }

    //eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < currentCallback.length; i++) {
      const gesture = currentCallback[i];

      if (event.handlerTag === gesture.handlerTag) {
        const e = event as UnwrappedGestureHandlerStateChangeEvent;
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
          const e = event as UnwrappedGestureHandlerEvent;
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
