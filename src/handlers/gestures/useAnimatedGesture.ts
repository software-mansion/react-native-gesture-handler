import { useEvent, useSharedValue } from 'react-native-reanimated';
import { useGesture } from './useGesture';
import { State } from '../../State';
import { InteractionBuilder, GestureType, HandlerCallbacks } from './gesture';
import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';

export function useAnimatedGesture(gesture: InteractionBuilder | GestureType) {
  function isStateChangeEvent(
    event:
      | UnwrappedGestureHandlerEvent
      | UnwrappedGestureHandlerStateChangeEvent
  ): event is UnwrappedGestureHandlerStateChangeEvent {
    'worklet';
    return event.oldState != null;
  }

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
        if (isStateChangeEvent(event)) {
          if (
            event.oldState === State.UNDETERMINED &&
            event.state === State.BEGAN
          ) {
            gesture.onBegan?.(event);
          } else if (
            (event.oldState === State.BEGAN ||
              event.oldState === State.UNDETERMINED) &&
            event.state === State.ACTIVE
          ) {
            gesture.onStart?.(event);
          } else if (
            event.oldState === State.ACTIVE &&
            event.state === State.END
          ) {
            gesture.onEnd?.(event, true);
          } else if (
            event.state === State.FAILED ||
            event.state === State.CANCELLED
          ) {
            gesture.onEnd?.(event, false);
          }
        } else {
          gesture.onUpdate?.(event);
        }
      }
    }
  };

  const event = useEvent(
    callback,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    true
  );

  preparedGesture.animatedEventHandler = event;
  preparedGesture.animatedHandlers = sharedHandlersCallbacks;

  return preparedGesture;
}
