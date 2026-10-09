import { useEffect } from 'react';

import type { GestureMountListener } from '../../../mountRegistry';
import { MountRegistry } from '../../../mountRegistry';
import type { GestureRef } from '../gesture';
import type { AttachedGestureState } from './types';

type MountedGesture = Parameters<GestureMountListener>[0];

function shouldUpdateDetector(
  relation: GestureRef[] | undefined,
  gesture: MountedGesture
) {
  if (relation === undefined) {
    return false;
  }

  for (const entry of relation) {
    // A gesture object gets its tag in `initialize`, when its own detector
    // attaches. The mount event carries that very object, so identity is enough.
    if (entry === gesture) {
      return true;
    }

    if (entry === null || typeof entry !== 'object' || !('current' in entry)) {
      continue;
    }

    const current = entry.current as { handlerTag?: number } | null | undefined;

    if (current?.handlerTag === gesture.handlerTag) {
      return true;
    }
  }

  return false;
}

export function useMountReactions(
  updateDetector: () => void,
  state: AttachedGestureState
) {
  useEffect(() => {
    return MountRegistry.addMountListener((gesture) => {
      // The detector may already be unmounted when this fires; bail out to avoid
      // updating a detached detector.
      if (!state.isMounted) {
        return;
      }

      // Nothing here can resolve late, skip the scan (most detectors)
      if (!state.hasExternalRelations) {
        return;
      }

      // Own gestures are resolved by the attach microtask, and on a reattach
      // they would match the sibling entries added by composition
      if (state.attachedGestures.includes(gesture as never)) {
        return;
      }

      // At this point the ref in the gesture config should be updated, so we can check if one of the gestures
      // set in a relation with the gesture got mounted. If so, we need to update the detector to propagate
      // the changes to the native side.
      for (const attachedGesture of state.attachedGestures) {
        const blocksHandlers = attachedGesture.config.blocksHandlers;
        const requireToFail = attachedGesture.config.requireToFail;
        const simultaneousWith = attachedGesture.config.simultaneousWith;

        if (
          shouldUpdateDetector(blocksHandlers, gesture) ||
          shouldUpdateDetector(requireToFail, gesture) ||
          shouldUpdateDetector(simultaneousWith, gesture)
        ) {
          updateDetector();

          // We can safely return here, if any other gestures should be updated, they will be by the above call
          return;
        }
      }
    });
  }, [updateDetector, state]);
}
