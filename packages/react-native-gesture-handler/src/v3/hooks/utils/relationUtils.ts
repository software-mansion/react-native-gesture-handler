import {
  ComposedGesture,
  Gesture,
  GestureRelations,
  NativeGesture,
} from '../../types';

export function isComposedGesture(
  gesture: NativeGesture | ComposedGesture
): gesture is ComposedGesture {
  return 'tags' in gesture;
}

export function prepareRelations(
  config: any,
  handlerTag: number
): GestureRelations {
  // TODO: Handle composed gestures passed into external relations
  const extractHandlerTags = (otherHandler: Gesture | Gesture[]): number[] => {
    if (!otherHandler) {
      return [];
    }

    let otherTags: number[];

    if (Array.isArray(otherHandler)) {
      otherTags = otherHandler.flatMap(
        (gesture: NativeGesture | ComposedGesture) =>
          isComposedGesture(gesture) ? gesture.tags : gesture.tag
      );
    } else {
      otherTags = isComposedGesture(otherHandler)
        ? otherHandler.tags
        : [otherHandler.tag];
    }

    return otherTags;
  };

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
