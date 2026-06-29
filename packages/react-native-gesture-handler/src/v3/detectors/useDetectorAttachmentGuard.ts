import { useEffect, useRef } from 'react';

import { tagMessage } from '../../utils';

// Maps a gesture's handlerTag to the id of the detector currently rendering it.
// Ownership is claimed in an effect and released in its cleanup (on unmount or
// when handlerTags change), so moving a gesture instance between detectors works
// as long as it isn't rendered by more than one detector at the same time.
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
