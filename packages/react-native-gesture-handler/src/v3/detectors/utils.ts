// This piece of magic traverses the gesture tree and populates `waitFor` and `simultaneousHandlers`
// arrays for each gesture. It traverses the tree recursively using DFS.
// `waitFor` and `simultaneousHandlers` are global data structures that will be populated into each gesture.
// For `waitFor` we need array as order of the gestures matters.
// For `simultaneousHandlers` we use Set as the order doesn't matter.

import { tagMessage } from '../../utils';
import {
  isComposedGesture,
  prepareRelations,
} from '../hooks/utils/relationUtils';
import { NativeProxy } from '../NativeProxy';
import { ComposedGestureName, Gesture } from '../types';

// The tree consists of ComposedGestures and NativeGestures. NativeGestures are always leaf nodes.
export const traverseAndConfigureRelations = (
  node: Gesture,
  simultaneousHandlers: Set<number>,
  waitFor: number[] = []
) => {
  // If we are in the leaf node, we want to fill gesture relations arrays with current
  // waitFor and simultaneousHandlers. We also want to configure relations on the native side.
  if (!isComposedGesture(node)) {
    node.gestureRelations = prepareRelations(node.config, node.handlerTag);

    node.gestureRelations.simultaneousHandlers.push(...simultaneousHandlers);
    node.gestureRelations.waitFor.push(...waitFor);

    NativeProxy.configureRelations(node.handlerTag, {
      waitFor: node.gestureRelations.waitFor,
      simultaneousHandlers: node.gestureRelations.simultaneousHandlers,
      blocksHandlers: node.gestureRelations.blocksHandlers,
    });

    return;
  }

  // If we are in the composed gesture, we want to traverse its children.
  node.gestures.forEach((child) => {
    // If child is composed gesture, we have to correctly fill `waitFor` and `simultaneousHandlers`.
    if (isComposedGesture(child)) {
      // We have to update `simultaneousHandlers` before traversing the child (going top-down).
      // Simultaneous is an all-to-all relation - it needs to be prepared when entering the node.
      // Exclusive is a one-to-many relation - gesture depends on the preceding ones and not on itself - it should be prepared when leaving the node (bottom-up).

      // If we go from a non-simultaneous gesture to a simultaneous gesture,
      // we add the tags of the simultaneous gesture to the `simultaneousHandlers`.
      // This way when we traverse the child, we already have the tags of the simultaneous gestures
      if (
        node.type !== ComposedGestureName.Simultaneous &&
        child.type === ComposedGestureName.Simultaneous
      ) {
        child.handlerTags.forEach((handlerTag) =>
          simultaneousHandlers.add(handlerTag)
        );
      }

      // If we go from a simultaneous gesture to a non-simultaneous gesture,
      // we remove the tags of the child gestures from the `simultaneousHandlers`,
      // as those are not simultaneous with each other.
      if (
        node.type === ComposedGestureName.Simultaneous &&
        child.type !== ComposedGestureName.Simultaneous
      ) {
        child.handlerTags.forEach((handlerTag) =>
          simultaneousHandlers.delete(handlerTag)
        );
      }

      // We will keep the current length of `waitFor` to reset it to previous state
      // after traversing the child.
      const length = waitFor.length;

      // We traverse the child, passing the current `waitFor` and `simultaneousHandlers`.
      traverseAndConfigureRelations(child, simultaneousHandlers, waitFor);

      // After traversing the child, we need to update `waitFor` and `simultaneousHandlers`

      // If we go back from a simultaneous gesture to a non-simultaneous gesture,
      // we want to delete the tags of the simultaneous gesture from the `simultaneousHandlers` -
      // those gestures are not simultaneous with each other anymore.
      if (
        child.type === ComposedGestureName.Simultaneous &&
        node.type !== ComposedGestureName.Simultaneous
      ) {
        node.handlerTags.forEach((handlerTag) =>
          simultaneousHandlers.delete(handlerTag)
        );
      }

      // If we go back from a non-simultaneous gesture to a simultaneous gesture,
      // we want to add the tags of the simultaneous gesture to the `simultaneousHandlers`,
      // as those gestures are simultaneous with other children of the current node.
      if (
        child.type !== ComposedGestureName.Simultaneous &&
        node.type === ComposedGestureName.Simultaneous
      ) {
        node.handlerTags.forEach((handlerTag) =>
          simultaneousHandlers.add(handlerTag)
        );
      }

      // If we go back to an exclusive gesture, we want to add the tags of the child gesture to the `waitFor` array.
      // This will allow us to pass exclusive gesture tags to the right subtree of the current node.
      if (node.type === ComposedGestureName.Exclusive) {
        child.handlerTags.forEach((handlerTag) => waitFor.push(handlerTag));
      }

      // If we go back from an exclusive gesture to a non-exclusive gesture, we want to reset the `waitFor` array
      // to the previous state, siblings of the exclusive gesture are not exclusive with it. Since we use `push` method to
      // add tags to the `waitFor` array, we can override `length` property to reset it to the previous state.
      if (
        child.type === ComposedGestureName.Exclusive &&
        node.type !== ComposedGestureName.Exclusive
      ) {
        waitFor.length = length;
      }
    }
    // This means that child is a leaf node.
    else {
      // We don't want to mark gesture as simultaneous with itself, so we remove its tag from the set.
      const hasRemovedTag = simultaneousHandlers.delete(child.handlerTag);

      traverseAndConfigureRelations(child, simultaneousHandlers, waitFor);

      if (hasRemovedTag) {
        simultaneousHandlers.add(child.handlerTag);
      }

      // In the leaf node, we only care about filling `waitFor` array.
      if (node.type === ComposedGestureName.Exclusive) {
        waitFor.push(child.handlerTag);
      }
    }
  });
};

export function configureRelations<THandlerData, TConfig>(
  gesture: Gesture<THandlerData, TConfig>
) {
  if (isComposedGesture(gesture)) {
    const simultaneousHandlers = new Set<number>(
      gesture.externalSimultaneousHandlers
    );

    // If root is simultaneous, we want to add its tags to the set
    if (gesture.type === ComposedGestureName.Simultaneous) {
      gesture.handlerTags.forEach((handlerTag) =>
        simultaneousHandlers.add(handlerTag)
      );
    }

    traverseAndConfigureRelations(gesture, simultaneousHandlers);
  } else {
    NativeProxy.configureRelations(
      gesture.handlerTag,
      gesture.gestureRelations
    );
  }
}

export function ensureNativeDetectorComponent(
  NativeDetectorComponent: unknown
): asserts NativeDetectorComponent {
  if (!NativeDetectorComponent) {
    throw new Error(
      tagMessage(
        'Gesture expects to run on the UI thread, but failed to create the Reanimated NativeDetector.'
      )
    );
  }
}

export const EMPTY_SET = new Set<number>();
