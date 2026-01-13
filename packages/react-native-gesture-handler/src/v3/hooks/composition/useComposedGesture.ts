import {
  StateChangeEventWithHandlerData,
  UpdateEventWithHandlerData,
  TouchEvent,
  ComposedGesture,
  ComposedGestureName,
  AnyGesture,
  ComposedGestureConfig,
} from '../../types';
import { tagMessage } from '../../../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { containsDuplicates, isComposedGesture } from '../utils';

// TODO: Simplify repeated relations (Simultaneous with Simultaneous, Exclusive with Exclusive, etc.)
export function useComposedGesture(
  type: ComposedGestureName,
  ...gestures: AnyGesture[]
): ComposedGesture {
  const handlerTags = gestures.flatMap((gesture) =>
    isComposedGesture(gesture) ? gesture.handlerTags : [gesture.handlerTag]
  );

  if (containsDuplicates(handlerTags)) {
    throw new Error(
      tagMessage(
        'Each gesture can be used only once in the gesture composition.'
      )
    );
  }

  const config: ComposedGestureConfig = {
    shouldUseReanimatedDetector: gestures.some(
      (gesture) => gesture.config.shouldUseReanimatedDetector
    ),
    dispatchesAnimatedEvents: gestures.some(
      (gesture) => gesture.config.dispatchesAnimatedEvents
    ),
  };

  if (config.shouldUseReanimatedDetector && config.dispatchesAnimatedEvents) {
    throw new Error(
      tagMessage(
        'Composed gestures cannot use both Reanimated and Animated events at the same time.'
      )
    );
  }

  const onGestureHandlerStateChange = (
    event: StateChangeEventWithHandlerData<unknown>
  ) => {
    for (const gesture of gestures) {
      if (gesture.detectorCallbacks.onGestureHandlerStateChange) {
        gesture.detectorCallbacks.onGestureHandlerStateChange(event);
      }
    }
  };

  const onGestureHandlerEvent = (
    event: UpdateEventWithHandlerData<unknown>
  ) => {
    for (const gesture of gestures) {
      if (gesture.detectorCallbacks.onGestureHandlerEvent) {
        gesture.detectorCallbacks.onGestureHandlerEvent(event);
      }
    }
  };

  const onGestureHandlerTouchEvent = (event: TouchEvent) => {
    for (const gesture of gestures) {
      if (gesture.detectorCallbacks.onGestureHandlerTouchEvent) {
        gesture.detectorCallbacks.onGestureHandlerTouchEvent(event);
      }
    }
  };

  const onReanimatedStateChange = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.detectorCallbacks.onReanimatedStateChange || null
    )
  );

  const onReanimatedUpdateEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.detectorCallbacks.onReanimatedUpdateEvent || null
    )
  );

  const onReanimatedTouchEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.detectorCallbacks.onReanimatedTouchEvent || null
    )
  );

  let onGestureHandlerAnimatedEvent;

  const gesturesWithAnimatedEvent = gestures.filter(
    (gesture) =>
      gesture.detectorCallbacks.onGestureHandlerAnimatedEvent !== undefined
  );

  if (gesturesWithAnimatedEvent.length > 0) {
    onGestureHandlerAnimatedEvent =
      gesturesWithAnimatedEvent[0].detectorCallbacks
        .onGestureHandlerAnimatedEvent;

    if (__DEV__ && gesturesWithAnimatedEvent.length > 1) {
      console.warn(
        tagMessage(
          'Composed gesture can handle only one Animated event. The first one will be used, others will be ignored.'
        )
      );
    }
  }

  return {
    handlerTags,
    type,
    config,
    detectorCallbacks: {
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
