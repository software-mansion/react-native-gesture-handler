import { NativeGesture } from '../../types';

export function useComposedGesture(...gestures: NativeGesture[]) {
  const tags = gestures.flatMap((gesture) => gesture.tag);
  const config = {
    shouldUseReanimated: gestures.some(
      (gesture) => gesture.config.shouldUseReanimated
    ),
    needsPointerData: gestures.some(
      (gesture) => gesture.config.needsPointerData
    ),
    dispatchesAnimatedEvents: gestures.some(
      (gesture) => gesture.config.dispatchesAnimatedEvents
    ),
    disableReanimated: gestures.some(
      (gesture) => gesture.config.disableReanimated
    ),
  };

  const onGestureHandlerStateChange = (event: any) => {
    for (const gesture of gestures) {
      if (gesture.gestureEvents.onGestureHandlerStateChange) {
        gesture.gestureEvents.onGestureHandlerStateChange(event);
      }
    }
  };

  const onGestureHandlerEvent = (event: any) => {
    for (const gesture of gestures) {
      if (gesture.gestureEvents.onGestureHandlerEvent) {
        gesture.gestureEvents.onGestureHandlerEvent(event);
      }
    }
  };

  const onGestureHandlerTouchEvent = (event: any) => {
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
