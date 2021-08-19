import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { State } from '../../State';
import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';
import { findHandler } from '../handlersRegistry';

let gestureHandlerEventSubscription: EmitterSubscription | null = null;
let gestureHandlerStateChangeEventSubscription: EmitterSubscription | null = null;

function onGestureHandlerEvent(event: UnwrappedGestureHandlerEvent) {
  const handler = findHandler(event.handlerTag);

  if (handler) {
    handler.handlers.onUpdate?.(event);
  }
}

function onGestureHandlerStateChange(
  event: UnwrappedGestureHandlerStateChangeEvent
) {
  const gesture = findHandler(event.handlerTag);

  if (gesture) {
    if (event.oldState === State.UNDETERMINED && event.state === State.BEGAN) {
      gesture.handlers.onBegan?.(event);
    } else if (
      (event.oldState === State.BEGAN ||
        event.oldState === State.UNDETERMINED) &&
      event.state === State.ACTIVE
    ) {
      gesture.handlers.onStart?.(event);
    } else if (event.oldState === State.ACTIVE && event.state === State.END) {
      gesture.handlers.onEnd?.(event, true);
    } else if (event.state === State.FAILED) {
      gesture.handlers.onEnd?.(event, false);
    } else if (event.state === State.CANCELLED) {
      gesture.handlers.onEnd?.(event, false);
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
    onGestureHandlerStateChange
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
