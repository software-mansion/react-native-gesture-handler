import {
  StateChangeEvent,
  UpdateEvent,
  TouchEvent,
  ComposedGesture,
  ComposedGestureType,
  Gesture,
} from '../../types';
import { tagMessage } from '../../../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { containsDuplicates, isComposedGesture } from '../utils/relationUtils';

// TODO: Simplify repeated relations (Simultaneous with Simultaneous, Exclusive with Exclusive, etc.)
export function useComposedGesture(
  type: ComposedGestureType,
  ...gestures: Gesture<unknown, unknown>[]
): ComposedGesture {
  const tags = gestures.flatMap((gesture) =>
    isComposedGesture(gesture) ? gesture.tags : gesture.tag
  );

  if (containsDuplicates(tags)) {
    console.warn(
      tagMessage(
        'Using the same gesture more than once in gesture composition can lead to unexpected behavior.'
      )
    );
  }

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

  const onGestureHandlerStateChange = (event: StateChangeEvent<unknown>) => {
    for (const gesture of gestures) {
      if (gesture.gestureEvents.onGestureHandlerStateChange) {
        gesture.gestureEvents.onGestureHandlerStateChange(event);
      }
    }
  };

  const onGestureHandlerEvent = (event: UpdateEvent<unknown>) => {
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
    type,
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
