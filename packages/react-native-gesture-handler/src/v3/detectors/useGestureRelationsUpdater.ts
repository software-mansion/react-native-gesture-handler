import { useEffect, useMemo } from 'react';

import { NativeProxy } from '../NativeProxy';
import type { Gesture } from '../types';
import { configureRelations } from './utils';

export function useGestureRelationsUpdater<TConfig, THandlerData>(
  gesture?: Gesture<TConfig, THandlerData>
) {
  const relations = useMemo(
    () => (gesture ? configureRelations(gesture) : null),
    [gesture]
  );

  useEffect(() => {
    if (!relations) {
      return;
    }

    // React runs effects bottom-up, we need to ensure that relations are applied after all effects
    // in the tree have run, so we defer to the next frame.
    const frame = requestAnimationFrame(() => {
      relations.forEach((rel, handlerTag) => {
        NativeProxy.configureRelations(handlerTag, rel);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [relations]);
}
