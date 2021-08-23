import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { State } from '../../State';
import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';
import { findHandler } from '../handlersRegistry';

let gestureHandlerEventSubscription: EmitterSubscription | null = null;
let gestureHandlerStateChangeEventSubscription: EmitterSubscription | null = null;

function isStateChangeEvent(
  event: UnwrappedGestureHandlerEvent | UnwrappedGestureHandlerStateChangeEvent
): event is UnwrappedGestureHandlerStateChangeEvent {
  return event.oldState != null;
}

function onGestureHandlerEvent(
  event: UnwrappedGestureHandlerEvent | UnwrappedGestureHandlerStateChangeEvent
) {
  const handler = findHandler(event.handlerTag);

  if (handler) {
    if (isStateChangeEvent(event)) {
      if (
        event.oldState === State.UNDETERMINED &&
        event.state === State.BEGAN
      ) {
        handler.handlers.onBegan?.(event);
      } else if (
        (event.oldState === State.BEGAN ||
          event.oldState === State.UNDETERMINED) &&
        event.state === State.ACTIVE
      ) {
        handler.handlers.onStart?.(event);
      } else if (event.oldState === State.ACTIVE && event.state === State.END) {
        handler.handlers.onEnd?.(event, true);
      } else if (
        event.state === State.FAILED ||
        event.state === State.CANCELLED
      ) {
        handler.handlers.onEnd?.(event, false);
      }
    } else {
      handler.handlers.onUpdate?.(event);
    }
  }
}

export function startListening() {
  stopListening();

  gestureHandlerEventSubscription = DeviceEventEmitter.addListener(
    'onGestureHandlerEvent',
    onGestureHandlerEvent
  );

  gestureHandlerStateChangeEventSubscription = DeviceEventEmitter.addListener(
    'onGestureHandlerStateChange',
    onGestureHandlerEvent
  );
}

export function stopListening() {
  if (gestureHandlerEventSubscription) {
    DeviceEventEmitter.removeSubscription(gestureHandlerEventSubscription);

    gestureHandlerEventSubscription = null;
  }

  if (gestureHandlerStateChangeEventSubscription) {
    DeviceEventEmitter.removeSubscription(
      gestureHandlerStateChangeEventSubscription
    );

    gestureHandlerStateChangeEventSubscription = null;
  }
}
