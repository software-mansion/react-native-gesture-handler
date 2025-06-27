import { GestureDetectorState } from './types';
import { useCallback } from 'react';
import findNodeHandle from '../../../findNodeHandle';

// Ref handler for the Wrap component attached under the GestureDetector.
// It's responsible for setting the viewRef on the state and triggering the reattaching of handlers
// if the view has changed.
export function useViewRefHandler(
  state: GestureDetectorState,
  updateAttachedGestures: (skipConfigUpdate?: boolean) => void
) {
  const refHandler = useCallback(
    (ref: Element) => {
      if (ref === null) {
        return;
      }

      state.viewRef = ref;

      // if it's the first render, also set the previousViewTag to prevent reattaching gestures when not needed
      if (!state.previousViewTag) {
        state.previousViewTag = findNodeHandle(state.viewRef);
      }

      // Pass true as `skipConfigUpdate`. Here we only want to trigger the eventual reattaching of handlers
      // in case the view has changed. If the view doesn't change, the update will be handled by detector.
      if (!state.firstRender) {
        updateAttachedGestures(true);
      }
    },
    [state, updateAttachedGestures]
  );

  return refHandler;
}
