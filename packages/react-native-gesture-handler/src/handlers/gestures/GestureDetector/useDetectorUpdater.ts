import React, { useCallback } from 'react';
import { GestureType } from '../gesture';
import { ComposedGesture } from '../gestureComposition';

import {
  AttachedGestureState,
  GestureDetectorState,
  WebEventHandler,
} from './types';
import { attachHandlers } from './attachHandlers';
import { updateHandlers } from './updateHandlers';
import { needsToReattach } from './needsToReattach';
import { dropHandlers } from './dropHandlers';
import { useForceRender, validateDetectorChildren } from './utils';
import findNodeHandle from '../../../findNodeHandle';

// Returns a function that's responsible for updating the attached gestures
// If the view has changed, it will reattach the handlers to the new view
// If the view remains the same, it will update the handlers with the new config
export function useDetectorUpdater(
  state: GestureDetectorState,
  preparedGesture: AttachedGestureState,
  gesturesToAttach: GestureType[],
  gestureConfig: ComposedGesture | GestureType,
  webEventHandlersRef: React.RefObject<WebEventHandler>
) {
  const forceRender = useForceRender();
  const updateAttachedGestures = useCallback(
    // skipConfigUpdate is used to prevent unnecessary updates when only checking if the view has changed
    (skipConfigUpdate?: boolean) => {
      // If the underlying view has changed we need to reattach handlers to the new view
      const viewTag = findNodeHandle(state.viewRef) as number;
      const didUnderlyingViewChange = viewTag !== state.previousViewTag;

      if (
        didUnderlyingViewChange ||
        needsToReattach(preparedGesture, gesturesToAttach)
      ) {
        validateDetectorChildren(state.viewRef);
        dropHandlers(preparedGesture);
        attachHandlers({
          preparedGesture,
          gestureConfig,
          gesturesToAttach,
          webEventHandlersRef,
          viewTag,
        });

        if (didUnderlyingViewChange) {
          state.previousViewTag = viewTag;
          state.forceRebuildReanimatedEvent = true;
          forceRender();
        }
      } else if (!skipConfigUpdate) {
        updateHandlers(preparedGesture, gestureConfig, gesturesToAttach);
      }
    },
    [
      forceRender,
      gestureConfig,
      gesturesToAttach,
      preparedGesture,
      state,
      webEventHandlersRef,
    ]
  );

  return updateAttachedGestures;
}
