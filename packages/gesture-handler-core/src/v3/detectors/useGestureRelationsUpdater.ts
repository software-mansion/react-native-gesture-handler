import { useEffect, useMemo } from 'react';

import type { CoreRuntime } from '../platform/Port';
import type { Gesture } from '../types';
import { configureRelations } from './utils';

export function useGestureRelationsUpdater<TConfig, THandlerData>(
  runtime: CoreRuntime,
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
        runtime.port.proxy.configureRelations(handlerTag, rel);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [runtime, relations]);
}
