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

// TODO: Handle composed gestures passed into external relations
export function prepareRelations(
  config: any,
  handlerTag: number
): GestureRelations {
  if (config.simultaneousWithExternalGesture) {
    if (Array.isArray(config.simultaneousWithExternalGesture)) {
      for (const gesture of config.simultaneousWithExternalGesture) {
        gesture.gestureRelations.simultaneousHandlers.push(handlerTag);
      }
    } else {
      config.simultaneousWithExternalGesture.gestureRelations.simultaneousHandlers.push(
        handlerTag
      );
    }
  }

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
