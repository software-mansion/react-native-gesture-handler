import { useEffect, useMemo, useRef } from 'react';

import type { ReanimatedHandler } from '../../../handlers/gestures/reanimatedWrapper';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
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

export function useReanimatedEventHandler<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  reanimatedHandler: ReanimatedHandler<TExtendedHandlerData> | undefined,
  changeEventCalculator: ChangeCalculatorType<TExtendedHandlerData> | undefined,
  fillInDefaultValues?: (event: GestureEvent<TExtendedHandlerData>) => void
) {
  const workletizedHandlers = useMemo(() => {
    // We don't want to call hooks conditionally, `useEvent` will be always called.
    // The only difference is whether we will send events to Reanimated or not.
    // The problem here is that if someone passes `Animated.event` as `onUpdate` prop,
    // it won't be workletized and therefore `useHandler` will throw. In that case we override it to empty `worklet`.
    if (!Reanimated?.isWorkletFunction(handlers.onUpdate)) {
      return {
        ...handlers,
        onUpdate: workletNOOP,
      };
    }

    return handlers;
  }, [handlers]);

  const callback = (
    event: UnpackedGestureHandlerEventWithHandlerData<
      THandlerData,
      TExtendedHandlerData
    >
  ) => {
    'worklet';
    eventHandler(
      handlerTag,
      event,
      workletizedHandlers,
      changeEventCalculator,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      reanimatedHandler?.context!,
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
  }, [handlerTag]);

  const reanimatedEvent = Reanimated?.useEvent(
    callback,
    REANIMATED_EVENT_NAMES,
    handlerTagChanged || !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
