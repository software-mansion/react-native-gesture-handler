import { useMemo } from 'react';
import {
  Reanimated,
  ReanimatedHandler,
} from '../../../handlers/gestures/reanimatedWrapper';
import {
  ChangeCalculatorType,
  GestureCallbacks,
  UnpackedGestureHandlerEventWithHandlerData,
} from '../../types';
import { eventHandler } from './eventHandler';

const workletNOOP = () => {
  'worklet';
  // no-op
};

export function useReanimatedEventHandler<TBaseHandlerData, THandlerData>(
  handlerTag: number,
  handlers: GestureCallbacks<TBaseHandlerData, THandlerData>,
  reanimatedHandler: ReanimatedHandler<THandlerData> | undefined,
  changeEventCalculator: ChangeCalculatorType<THandlerData> | undefined
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
    event: UnpackedGestureHandlerEventWithHandlerData<THandlerData>
  ) => {
    'worklet';
    eventHandler(
      handlerTag,
      event,
      workletizedHandlers,
      changeEventCalculator,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      reanimatedHandler?.context!,
      false
    );
  };

  const reanimatedEvent = Reanimated?.useEvent(
    callback,
    [
      'onGestureHandlerReanimatedEvent',
      'onGestureHandlerReanimatedStateChange',
      'onGestureHandlerReanimatedTouchEvent',
    ],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
