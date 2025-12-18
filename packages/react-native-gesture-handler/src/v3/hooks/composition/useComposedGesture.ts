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

  const defaultEventHandler = (
    event: GestureHandlerEventWithHandlerData<unknown>
  ) => {
    for (const gesture of gestures) {
      if (gesture.detectorCallbacks.defaultEventHandler) {
        gesture.detectorCallbacks.defaultEventHandler(event);
      }
    }
  };

  const reanimatedEventHandler = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.detectorCallbacks.reanimatedEventHandler || null
    )
  );

  let animatedEventHandler;

  const gesturesWithAnimatedEvent = gestures.filter(
    (gesture) => gesture.detectorCallbacks.animatedEventHandler !== undefined
  );

  if (gesturesWithAnimatedEvent.length > 0) {
    animatedEventHandler =
      gesturesWithAnimatedEvent[0].detectorCallbacks.animatedEventHandler;

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
      defaultEventHandler,
      reanimatedEventHandler,
      animatedEventHandler,
    },
    externalSimultaneousHandlers: [],
    gestures,
  };
}
