import React from 'react';
import { NativeGesture, ComposedGesture } from './types';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../utils';
import { isComposedGesture } from './hooks/utils';
import RNGestureHandlerModule from '../RNGestureHandlerModule';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture | ComposedGesture;
}

const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  // It might happen only with ReanimatedNativeDetector
  if (!NativeDetectorComponent) {
    throw new Error(
      tagMessage(
        'Gesture expects to run on the UI thread, but failed to create the Reanimated NativeDetector.'
      )
    );
  }

  // This piece of magic traverses the gesture tree and populates `waitFor` and `simultaneousHandlers`
  // arrays for each gesture. It traverses the tree recursively using DFS.
  // `waitFor` and `simultaneousHandlers` are global data structures that will be populated into each gesture.
  // For `waitFor` we need array as order of the gestures matters.
  // For `simultaneousHandlers` we use Set as the order doesn't matter.
  // The tree consists of ComposedGestures and NativeGestures. NativeGestures are always leaf nodes.
  const dfs = (
    node: NativeGesture | ComposedGesture,
    simultaneousHandlers: Set<number> = new Set(),
    waitFor: number[] = []
  ) => {
    // If we are in the leaf node, we want to fill gesture relations arrays with current
    // waitFor and simultaneousHandlers. We also want to configure relations on the native side.
    // TODO: handle `simultaneousWithExternalGesture`, `requreExternalGestureToFail`, `blocksExternalGesture`
    if (!isComposedGesture(node)) {
      node.simultaneousHandlers.push(...simultaneousHandlers);
      node.waitFor.push(...waitFor);

      RNGestureHandlerModule.configureRelations(node.tag, {
        waitFor,
        simultaneousHandlers: Array.from(simultaneousHandlers),
        blocksHandlers: node.blocksHandlers || [], // TODO: handle `blocksExternalGesture`
      });

      return;
    }

    // If we are in the composed gesture, we want to traverse its children.
    node.gestures.forEach((child) => {
      // If child is composed gesture, we have to correctly fill `waitFor` and `simultaneousHandlers`.
      if (isComposedGesture(child)) {
        // We have to update `simultaneousHandlers` before traversing the child.

        // If we go from a non-simultaneous gesture to a simultaneous gesture,
        // we add the tags of the simultaneous gesture to the `simultaneousHandlers`.
        // This way when we traverse the child, we already have the tags of the simultaneous gestures
        if (
          node.name !== 'SimultaneousGesture' &&
          child.name === 'SimultaneousGesture'
        ) {
          child.tags.forEach((tag) => simultaneousHandlers.add(tag));
        }

        // If we go from a simultaneous gesture to a non-simultaneous gesture,
        // we remove the tags of the child gestures from the `simultaneousHandlers`,
        // as those are not simultaneous with each other.
        if (
          node.name === 'SimultaneousGesture' &&
          child.name !== 'SimultaneousGesture'
        ) {
          child.tags.forEach((tag) => simultaneousHandlers.delete(tag));
        }

        // We will keep the current length of `waitFor` to reset it to previous state
        // after traversing the child.
        const length = waitFor.length;

        // We traverse the child, passing the current `waitFor` and `simultaneousHandlers`.
        dfs(child, simultaneousHandlers, waitFor);

        // After traversing the child, we need to update `waitFor` and `simultaneousHandlers`

        // If we go back from a simultaneous gesture to a non-simultaneous gesture,
        // we want to delete the tags of the simultaneous gesture from the `simultaneousHandlers` -
        // those gestures are not simultaneous with each other anymore.
        if (
          child.name === 'SimultaneousGesture' &&
          node.name !== 'SimultaneousGesture'
        ) {
          node.tags.forEach((tag) => simultaneousHandlers.delete(tag));
        }

        // If we go back from a non-simultaneous gesture to a simultaneous gesture,
        // we want to add the tags of the simultaneous gesture to the `simultaneousHandlers`,
        // as those gestures are simultaneous with other children of the current node.
        if (
          child.name !== 'SimultaneousGesture' &&
          node.name === 'SimultaneousGesture'
        ) {
          node.tags.forEach((tag) => simultaneousHandlers.add(tag));
        }

        // If we go back to an exclusive gesture, we want to add the tags of the child gesture to the `waitFor` array.
        // This will allow us to pass exclusive gesture tags to the right subtree of the current node.
        if (node.name === 'ExclusiveGesture') {
          child.tags.forEach((tag) => waitFor.push(tag));
        }

        // If we go back from an exclusive gesture to a non-exclusive gesture, we want to reset the `waitFor` array
        // to the previous state, siblings of the exclusive gesture are not exclusive with it. Since we use `push` method to
        // add tags to the `waitFor` array, we can override `length` property to reset it to the previous state.
        if (
          child.name === 'ExclusiveGesture' &&
          node.name !== 'ExclusiveGesture'
        ) {
          waitFor.length = length;
        }
      }
      // This means that child is a leaf node.
      else {
        // In the leaf node, we only care about filling `waitFor` array. First we traverse the child...
        dfs(child, simultaneousHandlers, waitFor);

        // ..and when we go back we add the tag of the child to the `waitFor` array.
        if (node.name === 'ExclusiveGesture') {
          waitFor.push(child.tag);
        }
      }
    });
  };

  if (gesture.name === 'SimultaneousGesture') {
    dfs(gesture, new Set(gesture.tags));
  } else {
    dfs(gesture);
  }

  return (
    <NativeDetectorComponent
      // @ts-ignore TODO: Fix types
      onGestureHandlerStateChange={
        gesture.gestureEvents.onGestureHandlerStateChange
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
      onGestureHandlerAnimatedEvent={
        gesture.gestureEvents.onGestureHandlerAnimatedEvent
      }
      // @ts-ignore TODO: Fix types
      onGestureHandlerTouchEvent={
        gesture.gestureEvents.onGestureHandlerTouchEvent
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={isComposedGesture(gesture) ? gesture.tags : [gesture.tag]}
      style={styles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
