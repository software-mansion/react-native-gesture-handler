import { useEffect } from 'react';

import { MountRegistry } from '../../../mountRegistry';
import { transformIntoHandlerTags } from '../../utils';
import type { GestureRef } from '../gesture';
import type { AttachedGestureState } from './types';

function shouldUpdateDetector(
  relation: GestureRef[] | undefined,
  mountedHandlerTags: ReadonlySet<number>
) {
  if (relation === undefined) {
    return false;
  }

  for (const tag of transformIntoHandlerTags(relation)) {
    if (mountedHandlerTags.has(tag)) {
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
    // The listener receives every handler tag that mounted in this tick, so each relation
    // is resolved once per batch instead of once per mounted gesture.
    return MountRegistry.addMountListener((mountedHandlerTags) => {
      // The detector may already be unmounted when this fires; bail out to avoid
      // updating a detached detector.
      if (!state.isMounted) {
        return;
      }

      // At this point the refs in the gesture configs should be updated, so we can check if one of
      // the gestures set in a relation with a just-mounted gesture got mounted. If so, we need to
      // update the detector to propagate the changes to the native side.
      for (const attachedGesture of state.attachedGestures) {
        const blocksHandlers = attachedGesture.config.blocksHandlers;
        const requireToFail = attachedGesture.config.requireToFail;
        const simultaneousWith = attachedGesture.config.simultaneousWith;

        if (
          shouldUpdateDetector(blocksHandlers, mountedHandlerTags) ||
          shouldUpdateDetector(requireToFail, mountedHandlerTags) ||
          shouldUpdateDetector(simultaneousWith, mountedHandlerTags)
        ) {
          updateDetector();

          // We can safely return here, if any other gestures should be updated, they will be by the above call
          return;
        }
      }
    });
  }, [updateDetector, state]);
}
