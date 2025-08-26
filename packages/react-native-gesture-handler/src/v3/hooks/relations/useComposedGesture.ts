import {
  NativeGesture,
  StateChangeEvent,
  UpdateEvent,
  TouchEvent,
  ComposedGesture,
  ComposedGestureType,
} from '../../types';
import { isComposedGesture } from '../utils';
import { tagMessage } from '../../../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';

// TODO: Simplify repeated relations (Simultaneous with Simultaneous, Exclusive with Exclusive, etc.)
export function useComposedGesture(
  ...gestures: (NativeGesture | ComposedGesture)[]
): ComposedGesture {
  const tags = gestures.flatMap((gesture) =>
    isComposedGesture(gesture) ? gesture.tags : gesture.tag
  );

  const config = {
    shouldUseReanimated: gestures.some(
      (gesture) => gesture.config.shouldUseReanimated
    ),
    dispatchesAnimatedEvents: gestures.some(
      (gesture) => gesture.config.dispatchesAnimatedEvents
    ),
  };

  if (config.shouldUseReanimated && config.dispatchesAnimatedEvents) {
    throw new Error(
      tagMessage(
        'Composed gestures cannot use both Reanimated and Animated events at the same time.'
      )
    );
  }

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

  const onReanimatedStateChange = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.gestureEvents.onReanimatedStateChange || null
    )
  );

  const onReanimatedUpdateEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.gestureEvents.onReanimatedUpdateEvent || null
    )
  );

  const onReanimatedTouchEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.gestureEvents.onReanimatedTouchEvent || null
    )
  );

  let onGestureHandlerAnimatedEvent;

  for (const gesture of gestures) {
    if (gesture.gestureEvents.onGestureHandlerAnimatedEvent) {
      onGestureHandlerAnimatedEvent =
        gesture.gestureEvents.onGestureHandlerAnimatedEvent;

      break;
    }
  }

  return {
    tags,
    type: ComposedGestureType.Race,
    config,
    gestureEvents: {
      onGestureHandlerStateChange,
      onGestureHandlerEvent,
      onGestureHandlerTouchEvent,
      onReanimatedStateChange,
      onReanimatedUpdateEvent,
      onReanimatedTouchEvent,
      onGestureHandlerAnimatedEvent,
    },
    gestures,
  };
}
