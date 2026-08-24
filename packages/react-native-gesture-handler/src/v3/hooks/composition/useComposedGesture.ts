import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../../utils';
import type {
  AnyGesture,
  ComposedGesture,
  ComposedGestureConfig,
  ComposedGestureName,
  GestureHandlerEventWithHandlerData,
} from '../../types';
import { containsDuplicates, isComposedGesture } from '../utils';

export function useComposedGesture(
  type: ComposedGestureName,
  ...gestures: AnyGesture[]
): ComposedGesture {
  // Nesting compositions of the same type is redundant, e.g. Simultaneous(a, Simultaneous(b, c))
  // is equivalent to Simultaneous(a, b, c). Same-type children are inlined to keep the tree shallow.
  // They come from this hook, so they are already flattened themselves.
  const flattenedGestures = gestures.flatMap((gesture) =>
    isComposedGesture(gesture) && gesture.type === type
      ? gesture.gestures
      : [gesture]
  );

  const handlerTags = flattenedGestures.flatMap((gesture) =>
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
    shouldUseReanimatedDetector: flattenedGestures.some(
      (gesture) => gesture.config.shouldUseReanimatedDetector
    ),
    dispatchesAnimatedEvents: flattenedGestures.some(
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

  const jsEventHandler = (
    event: GestureHandlerEventWithHandlerData<unknown, unknown>
  ) => {
    for (const gesture of flattenedGestures) {
      if (gesture.detectorCallbacks.jsEventHandler) {
        gesture.detectorCallbacks.jsEventHandler(event);
      }
    }
  };

  const reanimatedEventHandler = Reanimated?.useComposedEventHandler(
    flattenedGestures.map(
      (gesture) => gesture.detectorCallbacks.reanimatedEventHandler || null
    )
  );

  let animatedEventHandler;

  const gesturesWithAnimatedEvent = flattenedGestures.filter(
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
      jsEventHandler,
      reanimatedEventHandler,
      animatedEventHandler,
    },
    externalSimultaneousHandlers: [],
    gestures: flattenedGestures,
  };
}
