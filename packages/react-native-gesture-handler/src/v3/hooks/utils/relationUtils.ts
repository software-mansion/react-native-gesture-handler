import {
  ComposedGesture,
  ExternalRelations,
  Gesture,
  GestureRelations,
} from '../../types';

export function isComposedGesture<THandlerData, TConfig>(
  gesture: Gesture<THandlerData, TConfig> | ComposedGesture
): gesture is ComposedGesture {
  return 'handlerTags' in gesture;
}

function extractHandlerTags(
  otherHandler: Gesture | Gesture[] | undefined
): number[] {
  if (!otherHandler) {
    return [];
  }

  let otherTags: number[];

  if (Array.isArray(otherHandler)) {
    otherTags = otherHandler.flatMap((gesture: Gesture) =>
      isComposedGesture(gesture) ? gesture.handlerTags : [gesture.handlerTag]
    );
  } else {
    otherTags = isComposedGesture(otherHandler)
      ? otherHandler.handlerTags
      : [otherHandler.handlerTag];
  }

  return otherTags;
}

function makeSimultaneousWithSymmetric(
  otherHandler: Gesture | Gesture[] | undefined,
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
  relations: ExternalRelations,
  handlerTag: number
): GestureRelations {
  makeSimultaneousWithSymmetric(relations.simultaneousWith, handlerTag);

  return {
    simultaneousHandlers: extractHandlerTags(relations.simultaneousWith),
    waitFor: extractHandlerTags(relations.requireToFail),
    blocksHandlers: extractHandlerTags(relations.block),
  };
}

export function containsDuplicates(tags: number[]) {
  return new Set(tags).size !== tags.length;
}
