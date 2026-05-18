import { useEffect, useMemo } from 'react';

import { NativeProxy } from '../NativeProxy';
import type { Gesture } from '../types';
import { configureRelations } from './utils';

// `configureRelations` used to run synchronously during render, which made the first call a no-op:
// gestures are created in `useGesture`'s effect, so the handler did not exist on the native side
// yet. Now we compute the relations map in `useMemo` and apply it in an effect; on the native side
// `configureRelations` uses the registry's observer API to defer the apply until the handler is
// actually registered, so the race is handled regardless of effect ordering.
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

    relations.forEach((rel, handlerTag) => {
      NativeProxy.configureRelations(handlerTag, rel);
    });
  }, [relations]);
}
