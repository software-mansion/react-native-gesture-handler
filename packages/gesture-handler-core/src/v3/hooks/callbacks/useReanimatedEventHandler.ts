import { useEffect, useMemo, useRef } from 'react';

import type { CoreRuntime, LastUpdateEventMap } from '../../platform/Port';
import type {
  ReanimatedContext,
  ReanimatedHandler,
  SimplifiedShareableHost,
} from '../../platform/ReanimatedIntegration';
import type {
  ChangeCalculatorType,
  GestureCallbacks,
  GestureEvent,
  UnpackedGestureHandlerEventWithHandlerData,
} from '../../types';
import { eventHandler } from './eventHandler';

const REANIMATED_EVENT_NAMES = [
  'onGestureHandlerReanimatedEvent',
  'onGestureHandlerReanimatedStateChange',
  'onGestureHandlerReanimatedTouchEvent',
];

const workletNOOP = () => {
  'worklet';
  // no-op
};

type ShareableLastUpdateEventMap =
  | SimplifiedShareableHost<LastUpdateEventMap>
  | undefined;

// Takes the map as an argument on purpose: reading a lazily-initialized
// binding from this module-scope worklet would snapshot its value at module
// evaluation — before the first `getLastUpdateEventMap()` call — so the
// UI-runtime copy would stay `undefined` forever and the cleanup would
// silently never run. `scheduleOnUI` arguments are serialized fresh on every
// call, so they always carry the initialized map.
function deleteHandlerEventEntry(
  map: ShareableLastUpdateEventMap,
  handlerTag: number
) {
  'worklet';
  if (map === undefined) {
    return;
  }

  map.value.delete(handlerTag);
}

export function useReanimatedEventHandler<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  runtime: CoreRuntime,
  handlerTag: number,
  handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  reanimatedHandler: ReanimatedHandler<TExtendedHandlerData> | undefined,
  changeEventCalculator: ChangeCalculatorType<TExtendedHandlerData> | undefined,
  fillInDefaultValues?: (event: GestureEvent<TExtendedHandlerData>) => void
) {
  const { reanimated, worklets } = runtime.port;

  const workletizedHandlers = useMemo(() => {
    // We don't want to call hooks conditionally, `useEvent` will be always called.
    // The only difference is whether we will send events to Reanimated or not.
    // The problem here is that if someone passes `Animated.event` as `onUpdate` prop,
    // it won't be workletized and therefore `useHandler` will throw. In that case we override it to empty `worklet`.
    if (!worklets?.isWorkletFunction(handlers.onUpdate)) {
      return {
        ...handlers,
        onUpdate: workletNOOP,
      };
    }

    return handlers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]);

  // Obtained on the JS thread during render so the worklet below captures the
  // initialized map rather than the runtime object.
  const updateEventMap = runtime.getLastUpdateEventMap();

  const callback = (
    event: UnpackedGestureHandlerEventWithHandlerData<
      THandlerData,
      TExtendedHandlerData
    >
  ) => {
    'worklet';
    // Undefined only when worklets are absent — and then this callback is
    // never registered (`reanimated?.useEvent` below short-circuits).
    if (updateEventMap === undefined) {
      return;
    }

    let context = updateEventMap.value.get(event.handlerTag);
    if (context === undefined) {
      context = { lastUpdateEvent: undefined };
      updateEventMap.value.set(event.handlerTag, context);
    }

    eventHandler(
      handlerTag,
      event,
      workletizedHandlers,
      changeEventCalculator,
      context as ReanimatedContext<TExtendedHandlerData>,
      false,
      fillInDefaultValues
    );
  };

  // Fast Refresh invalidates `useMemo` caches but preserves `useRef`, so the
  // `handlerTag` computed with `useMemo([])` in `useGesture` can regenerate
  // on FR. Without forcing a rebuild, the registered worklet keeps the old
  // `handlerTag` in its closure and `isEventForHandlerWithTag` rejects every
  // event emitted by the freshly-created native handler.
  const prevHandlerTagRef = useRef(handlerTag);
  const handlerTagChanged = prevHandlerTagRef.current !== handlerTag;

  // Write after commit so interrupted or re-invoked renders don't desync the
  // ref from what was actually committed.
  useEffect(() => {
    prevHandlerTagRef.current = handlerTag;

    return () => {
      worklets?.scheduleOnUI(
        deleteHandlerEventEntry,
        updateEventMap,
        handlerTag
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlerTag, updateEventMap]);

  const reanimatedEvent = reanimated?.useEvent(
    callback,
    REANIMATED_EVENT_NAMES,
    handlerTagChanged || !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
