import { useEffect, useMemo, useRef } from 'react';

import type { CoreRuntime } from '../../platform/Port';
import type {
  ChangeCalculatorType,
  GestureCallbacks,
  GestureEvent,
  ReanimatedContext,
  ReanimatedHandler,
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
  const reanimated = runtime.port.reanimated;
  const lastUpdateEventMap = runtime.lastUpdateEventMap;

  const workletizedHandlers = useMemo(() => {
    // We don't want to call hooks conditionally, `useEvent` will be always called.
    // The only difference is whether we will send events to Reanimated or not.
    // The problem here is that if someone passes `Animated.event` as `onUpdate` prop,
    // it won't be workletized and therefore `useHandler` will throw. In that case we override it to empty `worklet`.
    if (!reanimated?.isWorkletFunction(handlers.onUpdate)) {
      return {
        ...handlers,
        onUpdate: workletNOOP,
      };
    }

    return handlers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]);

  const callback = (
    event: UnpackedGestureHandlerEventWithHandlerData<
      THandlerData,
      TExtendedHandlerData
    >
  ) => {
    'worklet';
    // If we're on Reanimated path, lastUpdateEventMap should always be defined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let context = lastUpdateEventMap!.value.get(event.handlerTag);
    if (context === undefined) {
      context = { lastUpdateEvent: undefined };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      lastUpdateEventMap!.value.set(event.handlerTag, context);
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
      reanimated?.runOnUI?.((tag: number) => {
        'worklet';
        lastUpdateEventMap?.value.delete(tag);
      })(handlerTag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlerTag]);

  const reanimatedEvent = reanimated?.useEvent(
    callback,
    REANIMATED_EVENT_NAMES,
    handlerTagChanged || !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
