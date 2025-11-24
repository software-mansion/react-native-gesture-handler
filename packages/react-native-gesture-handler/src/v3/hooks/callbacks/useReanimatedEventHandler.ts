import {
  Reanimated,
  ReanimatedHandler,
} from '../../../handlers/gestures/reanimatedWrapper';
import {
  ChangeCalculatorType,
  GestureCallbacks,
  UnpackedGestureHandlerEvent,
} from '../../types';
import { getStateChangeHandler } from './stateChangeHandler';
import { getTouchEventHandler } from './touchEventHandler';
import { getUpdateHandler } from './updateHandler';

export function useReanimatedEventHandler<THandlerData>(
  handlerTag: number,
  handlers: GestureCallbacks<THandlerData>,
  reanimatedHandler: ReanimatedHandler<THandlerData> | undefined,
  changeEventCalculator: ChangeCalculatorType<THandlerData> | undefined
) {
  // We don't want to call hooks conditionally, `useEvent` will be always called.
  // The only difference is whether we will send events to Reanimated or not.
  // The problem here is that if someone passes `Animated.event` as `onUpdate` prop,
  // it won't be workletized and therefore `useHandler` will throw. In that case we override it to empty `worklet`.
  if (!Reanimated?.isWorkletFunction(handlers.onUpdate)) {
    handlers.onUpdate = () => {
      'worklet';
      // no-op
    };
  }

  const stateChangeCallback = getStateChangeHandler(
    handlerTag,
    handlers,
    reanimatedHandler?.context
  );

  const updateCallback = getUpdateHandler(
    handlerTag,
    handlers,
    reanimatedHandler?.context,
    changeEventCalculator
  );

  const touchCallback = getTouchEventHandler(handlerTag, handlers);

  const callback = (event: UnpackedGestureHandlerEvent<THandlerData>) => {
    'worklet';
    // console.log('Reanimated update event received:', event);
    if ('oldState' in event && event.oldState !== undefined) {
      stateChangeCallback(event);
    } else if ('allTouches' in event) {
      touchCallback(event);
    } else {
      updateCallback(event);
    }
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
