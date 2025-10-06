import {
  StateChangeEvent,
  UpdateEvent,
  TouchEvent,
  ComposedGesture,
  ComposedGestureName,
  Gesture,
} from '../../types';
import { tagMessage } from '../../../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { containsDuplicates, isComposedGesture } from '../utils';

// TODO: Simplify repeated relations (Simultaneous with Simultaneous, Exclusive with Exclusive, etc.)
export function useComposedGesture(
  type: ComposedGestureName,
  ...gestures: Gesture[]
): ComposedGesture {
  const tags = gestures.flatMap((gesture) =>
    isComposedGesture(gesture) ? gesture.tags : gesture.tag
  );

  if (containsDuplicates(tags)) {
    throw new Error(
      tagMessage(
        'Each gesture can be used only once in the gesture composition.'
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

  const gesturesWithAnimatedEvent = gestures.filter(
    (gesture) =>
      gesture.gestureEvents.onGestureHandlerAnimatedEvent !== undefined
  );

  if (gesturesWithAnimatedEvent.length > 0) {
    onGestureHandlerAnimatedEvent =
      gesturesWithAnimatedEvent[0].gestureEvents.onGestureHandlerAnimatedEvent;

    if (__DEV__ && gesturesWithAnimatedEvent.length > 1) {
      console.warn(
        tagMessage(
          'Composed gesture can handle only one Animated event. The first one will be used, others will be ignored.'
        )
      );
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
    externalSimultaneousHandlers: [],
    gestures,
  };
}
