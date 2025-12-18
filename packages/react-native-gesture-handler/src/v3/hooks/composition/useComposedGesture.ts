import {
  ComposedGesture,
  ComposedGestureName,
  AnyGesture,
  ComposedGestureConfig,
  GestureHandlerEventWithHandlerData,
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

  const onGestureHandlerEvent = (
    event: GestureHandlerEventWithHandlerData<unknown>
  ) => {
    for (const gesture of gestures) {
      if (gesture.detectorCallbacks.onGestureHandlerEvent) {
        gesture.detectorCallbacks.onGestureHandlerEvent(event);
      }
    }
  };

  const onGestureHandlerReanimatedEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) =>
        gesture.detectorCallbacks.onGestureHandlerReanimatedEvent || null
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
      onGestureHandlerEvent,
      onGestureHandlerReanimatedEvent,
      onGestureHandlerAnimatedEvent,
    },
    externalSimultaneousHandlers: [],
    gestures,
  };
}
