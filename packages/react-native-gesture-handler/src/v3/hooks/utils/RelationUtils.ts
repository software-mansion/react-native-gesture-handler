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

export function prepareRelations(config: any): GestureRelations {
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

  return {
    simultaneousHandlers: extractHandlerTags(
      config.simultaneousWithExternalGesture
    ),
    waitFor: extractHandlerTags(config.requireExternalGestureToFail),
    blocksHandlers: extractHandlerTags(config.blocksExternalGesture),
  };
}
