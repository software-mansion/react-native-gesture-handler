import { Reanimated } from './reanimatedWrapper';
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
  if (!Reanimated) {
    return preparedGesture;
  }

  // The following code will be executed only if react-native-reanimated
  // has been successfully imported. This state shoouldn't change while
  // the app is running so the execution path will be the same
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sharedHandlersCallbacks = Reanimated.useSharedValue<
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

    //Using for-of loop here causes crash, because worklets do not support it,
    //consider changing this in future when support for it is added
    //eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < currentCallback.length; i++) {
      const gesture = currentCallback[i];

      if (event.handlerTag === gesture.handlerTag) {
        if (isStateChangeEvent(event)) {
          if (
            event.oldState === State.UNDETERMINED &&
            event.state === State.BEGAN
          ) {
            if (gesture.isOnBeganWorklet) {
              gesture.onBegan?.(event);
            } else if (gesture.onBegan) {
              console.warn('Animated gesture callback must be a worklet');
            }
          } else if (
            (event.oldState === State.BEGAN ||
              event.oldState === State.UNDETERMINED) &&
            event.state === State.ACTIVE
          ) {
            if (gesture.isOnStartWorklet) {
              gesture.onStart?.(event);
            } else if (gesture.onStart) {
              console.warn('Animated gesture callback must be a worklet');
            }
          } else if (
            event.oldState === State.ACTIVE &&
            event.state === State.END
          ) {
            if (gesture.isOnEndWorklet) {
              gesture.onEnd?.(event, true);
            } else if (gesture.onEnd) {
              console.warn('Animated gesture callback must be a worklet');
            }
          } else if (
            event.state === State.FAILED ||
            event.state === State.CANCELLED
          ) {
            if (gesture.isOnEndWorklet) {
              gesture.onEnd?.(event, false);
            } else if (gesture.onEnd) {
              console.warn('Animated gesture callback must be a worklet');
            }
          }
        } else {
          if (gesture.isOnUpdateWorklet) {
            gesture.onUpdate?.(event);
          } else if (gesture.onUpdate) {
            console.warn('Animated gesture callback must be a worklet');
          }
        }
      }
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const event = Reanimated.useEvent(
    callback,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    true
  );

  preparedGesture.animatedEventHandler = event;
  preparedGesture.animatedHandlers = sharedHandlersCallbacks;

  return preparedGesture;
}
