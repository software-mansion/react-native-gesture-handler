import { ComposedGesture, Gesture, GestureRelations } from '../../types';

export function isComposedGesture(
  gesture: Gesture
): gesture is ComposedGesture {
  return 'tags' in gesture;
}

function extractHandlerTags(otherHandler: Gesture | Gesture[]): number[] {
  if (!otherHandler) {
    return [];
  }

  let otherTags: number[];

  if (Array.isArray(otherHandler)) {
    otherTags = otherHandler.flatMap((gesture: Gesture) =>
      isComposedGesture(gesture) ? gesture.tags : gesture.tag
    );
  } else {
    otherTags = isComposedGesture(otherHandler)
      ? otherHandler.tags
      : [otherHandler.tag];
  }

  return otherTags;
}

function makeSimultaneousWithExternalGestureSymmetric(
  otherHandler: Gesture | Gesture[],
  handlerTag: number
) {
  if (!otherHandler) {
    return;
  }

  const processSingleGesture = (gesture: Gesture) => {
    const simultaneousHandlers = isComposedGesture(gesture)
      ? gesture.externalSimultaneousHandlers
      : gesture.gestureRelations.simultaneousHandlers;

    if (!simultaneousHandlers.includes(handlerTag)) {
      simultaneousHandlers.push(handlerTag);
    }
  };

  if (Array.isArray(otherHandler)) {
    otherHandler.forEach(processSingleGesture);
  } else {
    processSingleGesture(otherHandler);
  }
}

export function prepareRelations(
  config: any,
  handlerTag: number
): GestureRelations {
  makeSimultaneousWithExternalGestureSymmetric(
    config.simultaneousWithExternalGesture,
    handlerTag
  );

  return {
    simultaneousHandlers: extractHandlerTags(
      config.simultaneousWithExternalGesture
    ),
    waitFor: extractHandlerTags(config.requireExternalGestureToFail),
    blocksHandlers: extractHandlerTags(config.blocksExternalGesture),
  };
}

export function containsDuplicates(tags: number[]) {
  return new Set(tags).size !== tags.length;
}
