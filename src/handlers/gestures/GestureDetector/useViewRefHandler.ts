import { isFabric, tagMessage } from '../../../utils';
import { getShadowNodeFromRef } from '../../../getShadowNodeFromRef';

import { GestureDetectorState } from './types';
import React, { useCallback } from 'react';
import findNodeHandle from '../../../findNodeHandle';

declare const global: {
  isViewFlatteningDisabled: (node: unknown) => boolean | null; // JSI function
};

type Props = {
  reanimatedContext?: { current: number },
}

// Ref handler for the Wrap component attached under the GestureDetector.
// It's responsible for setting the viewRef on the state and triggering the reattaching of handlers
// if the view has changed.
export function useViewRefHandler(
  state: GestureDetectorState,
  updateAttachedGestures: (skipConfigUpdate?: boolean) => void
) {
  const refHandler = useCallback(
    (ref: (React.Component<Props>)) => {
      if (ref === null) {
        return;
      }

      state.viewRef = ref;

      // if it's the first render, also set the previousViewTag to prevent reattaching gestures when not needed
      if (state.previousViewTag === -1) {
        const reanimatedContext = ref.props.reanimatedContext;
        if (reanimatedContext && reanimatedContext.current > 0) {
          state.previousViewTag = reanimatedContext.current;
        } else {
          state.previousViewTag = findNodeHandle(state.viewRef) as number;
        }
      }

      // Pass true as `skipConfigUpdate`. Here we only want to trigger the eventual reattaching of handlers
      // in case the view has changed. If the view doesn't change, the update will be handled by detector.
      if (!state.firstRender) {
        updateAttachedGestures(true);
      }

      if (__DEV__ && isFabric() && global.isViewFlatteningDisabled) {
        const node = getShadowNodeFromRef(ref);
        if (global.isViewFlatteningDisabled(node) === false) {
          console.error(
            tagMessage(
              'GestureDetector has received a child that may get view-flattened. ' +
                '\nTo prevent it from misbehaving you need to wrap the child with a `<View collapsable={false}>`.'
            )
          );
        }
      }
    },
    [state, updateAttachedGestures]
  );

  return refHandler;
}
