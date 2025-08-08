import {
  NativeGesture,
  StateChangeEvent,
  UpdateEvent,
  TouchEvent,
} from '../../types';

export function useComposedGesture(...gestures: NativeGesture[]) {
  const tags = gestures.flatMap((gesture) => gesture.tag);

  const config = {
    shouldUseReanimated: gestures.some(
      (gesture) => gesture.config.shouldUseReanimated
    ),
    dispatchesAnimatedEvents: gestures.some(
      (gesture) => gesture.config.dispatchesAnimatedEvents
    ),
  };

  const onGestureHandlerStateChange = (
    event: StateChangeEvent<Record<string, unknown>>
  ) => {
    for (const gesture of gestures) {
      if (gesture.gestureEvents.onGestureHandlerStateChange) {
        gesture.gestureEvents.onGestureHandlerStateChange(event);
      }
    }
  };

  const onGestureHandlerEvent = (
    event: UpdateEvent<Record<string, unknown>>
  ) => {
    for (const gesture of gestures) {
      if (gesture.gestureEvents.onGestureHandlerEvent) {
        gesture.gestureEvents.onGestureHandlerEvent(event);
      }
    }
  };

  const onGestureHandlerTouchEvent = (event: TouchEvent) => {
    for (const gesture of gestures) {
      if (gesture.gestureEvents.onGestureHandlerTouchEvent) {
        gesture.gestureEvents.onGestureHandlerTouchEvent(event);
      }
    }
  };

  let onGestureHandlerAnimatedEvent;

  for (const gesture of gestures) {
    if (gesture.gestureEvents.onGestureHandlerAnimatedEvent) {
      onGestureHandlerAnimatedEvent =
        gesture.gestureEvents.onGestureHandlerAnimatedEvent;

      break;
    }
  }

  return {
    tag: tags,
    name: 'ComposedGesture',
    config,
    gestureEvents: {
      onGestureHandlerStateChange,
      onGestureHandlerEvent,
      onGestureHandlerAnimatedEvent,
      onGestureHandlerTouchEvent,
    },
  };
}
