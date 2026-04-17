import { useMemo } from 'react';

import type { ReanimatedHandler } from '../../../handlers/gestures/reanimatedWrapper';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import type {
  ChangeCalculatorType,
  GestureCallbacks,
  GestureEvent,
  UnpackedGestureHandlerEventWithHandlerData,
} from '../../types';
import { eventHandler } from './eventHandler';

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
  let didUpdateHandlers = false;
  const workletizedHandlers = useMemo(() => {
    didUpdateHandlers = true;
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

  const reanimatedEvent = Reanimated?.useEvent(
    callback,
    [
      'onGestureHandlerReanimatedEvent',
      'onGestureHandlerReanimatedStateChange',
      'onGestureHandlerReanimatedTouchEvent',
    ],
    didUpdateHandlers || !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
