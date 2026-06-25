import { useEffect, useRef } from 'react';

import { tagMessage } from '../../utils';

// Maps a gesture's handlerTag to the id of the detector that currently renders
// it. Ownership is claimed on mount and released on unmount rather than being
// tied to the gesture's whole lifetime, so reattaching the same gesture to a
// different detector (e.g. a conditionally rendered one) keeps working.
// the previous detector releases the tag on unmount before the next one claims it.
const detectorByHandlerTag = new Map<number, number>();

let nextDetectorId = 0;

export function useDetectorAttachmentGuard(handlerTags: number[]) {
  const detectorId = useRef(-1);

  if (detectorId.current === -1) {
    detectorId.current = nextDetectorId++;
  }

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const id = detectorId.current;

    for (const tag of handlerTags) {
      const owner = detectorByHandlerTag.get(tag);

      if (owner !== undefined && owner !== id) {
        throw new Error(
          tagMessage(
            'Using the same gesture instance across multiple GestureDetectors is not possible. Create a separate gesture for each detector.'
          )
        );
      }
    }

    for (const tag of handlerTags) {
      detectorByHandlerTag.set(tag, id);
    }

    return () => {
      for (const tag of handlerTags) {
        if (detectorByHandlerTag.get(tag) === id) {
          detectorByHandlerTag.delete(tag);
        }
      }
    };
  }, [handlerTags]);
}
