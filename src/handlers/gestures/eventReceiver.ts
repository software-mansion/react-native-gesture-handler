import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { State } from '../../State';
import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';
import {
  findHandler,
  getComposedCallbacksForHandler,
} from '../handlersRegistry';
import { BaseGesture } from './gesture';
import { ComposedGestureConfiguration } from './gestureComposition';

let gestureHandlerEventSubscription: EmitterSubscription | null = null;
let gestureHandlerStateChangeEventSubscription: EmitterSubscription | null = null;

let activeHandlers: number[] = [];

function isStateChangeEvent(
  event: UnwrappedGestureHandlerEvent | UnwrappedGestureHandlerStateChangeEvent
): event is UnwrappedGestureHandlerStateChangeEvent {
  return event.oldState != null;
}

function onGestureHandlerEvent(
  event: UnwrappedGestureHandlerEvent | UnwrappedGestureHandlerStateChangeEvent
) {
  const handler = findHandler(event.handlerTag) as BaseGesture<
    Record<string, unknown>
  >;

  if (handler) {
    if (isStateChangeEvent(event)) {
      dispachStateChange(event, handler);

      const callbacks = getComposedCallbacksForHandler(event.handlerTag);
      tryActivatingComposedGesture(event, callbacks);
      updateActiveHandlers(event);
      tryEndingComposedGestures(event, callbacks);
    } else {
      handler.handlers.onUpdate?.(event);
    }
  }
}

function dispachStateChange(
  event: UnwrappedGestureHandlerStateChangeEvent,
  handler: BaseGesture<Record<string, unknown>>
) {
  if (event.oldState === State.UNDETERMINED && event.state === State.BEGAN) {
    handler.handlers.onBegan?.(event);
  } else if (
    (event.oldState === State.BEGAN || event.oldState === State.UNDETERMINED) &&
    event.state === State.ACTIVE
  ) {
    handler.handlers.onStart?.(event);
  } else if (event.oldState === State.ACTIVE && event.state === State.END) {
    handler.handlers.onEnd?.(event, true);
  } else if (event.state === State.FAILED || event.state === State.CANCELLED) {
    handler.handlers.onEnd?.(event, false);
  }
}

function updateActiveHandlers(event: UnwrappedGestureHandlerStateChangeEvent) {
  if (
    event.state === State.BEGAN &&
    !activeHandlers.includes(event.handlerTag)
  ) {
    activeHandlers.push(event.handlerTag);
  } else if (event.state === State.ACTIVE) {
    if (activeHandlers.includes(event.handlerTag)) {
      activeHandlers = activeHandlers.filter((tag) => tag !== event.handlerTag);
    }

    if (!activeHandlers.includes(-event.handlerTag)) {
      activeHandlers.push(-event.handlerTag);
    }
  } else if (
    (event.state === State.CANCELLED ||
      event.state === State.FAILED ||
      event.state === State.END) &&
    (activeHandlers.includes(event.handlerTag) ||
      activeHandlers.includes(-event.handlerTag))
  ) {
    activeHandlers = activeHandlers.filter(
      (tag) => tag !== event.handlerTag && tag !== -event.handlerTag
    );
  }
}

function tryEndingComposedGestures(
  event: UnwrappedGestureHandlerStateChangeEvent,
  callbacksForEvent: ComposedGestureConfiguration[]
) {
  if (
    event.state === State.CANCELLED ||
    event.state === State.FAILED ||
    event.state === State.END
  ) {
    for (const callbacks of callbacksForEvent) {
      if (
        activeHandlers.find((element) =>
          callbacks.requiredHandlers.includes(element)
        ) === undefined &&
        activeHandlers.find((element) =>
          callbacks.requiredHandlers.includes(-element)
        ) === undefined
      ) {
        callbacks.callbacks.onEnd?.();
      }
    }
  }
}

function tryActivatingComposedGesture(
  event: UnwrappedGestureHandlerStateChangeEvent,
  callbacksForEvent: ComposedGestureConfiguration[]
) {
  if (event.state === State.ACTIVE) {
    for (const callbacks of callbacksForEvent) {
      let dispachEvent = true;

      for (const tag of callbacks.requiredHandlers) {
        if (activeHandlers.includes(-tag)) {
          dispachEvent = false;
          break;
        }
      }

      if (dispachEvent) {
        callbacks.callbacks.onStart?.();
      }
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
