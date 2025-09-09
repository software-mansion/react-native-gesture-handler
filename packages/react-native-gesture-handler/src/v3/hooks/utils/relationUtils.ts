import {
  BaseGestureConfig,
  ComposedGesture,
  Gesture,
  GestureRelations,
  NativeGesture,
} from '../../types';

export function isComposedGesture(
  gesture: NativeGesture<unknown, unknown> | ComposedGesture
): gesture is ComposedGesture {
  return 'tags' in gesture;
}

function extractHandlerTags(
  otherHandler:
    | Gesture<unknown, unknown>
    | Gesture<unknown, unknown>[]
    | undefined
): number[] {
  if (!otherHandler) {
    return [];
  }

  let otherTags: number[];

  if (Array.isArray(otherHandler)) {
    otherTags = otherHandler.flatMap((gesture: Gesture<unknown, unknown>) =>
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
export function prepareRelations<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>,
  handlerTag: number
): GestureRelations {
  if (config.simultaneousWithExternalGesture) {
    if (Array.isArray(config.simultaneousWithExternalGesture)) {
      for (const gesture of config.simultaneousWithExternalGesture) {
        // @ts-ignore TODO: handle composed gestures
        gesture.gestureRelations.simultaneousHandlers.push(handlerTag);
      }
    } else {
      // @ts-ignore TODO: handle composed gestures
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
  const tagSet = new Set(tags);

  return tagSet.size !== tags.length;
}
