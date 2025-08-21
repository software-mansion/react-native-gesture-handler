import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers } from '../../../types';
import { onGestureHandlerEvent } from '../onGestureHandlerEvent';

export function useReanimatedUpdateEvent(handlerTag: number, config: any) {
  const { onUpdate, changeEventCalculator } = config;

  const handlers: CallbackHandlers = { ...(onUpdate ? { onUpdate } : {}) };

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  const callback = onGestureHandlerEvent(
    handlerTag,
    handlers,
    reanimatedHandler?.context,
    changeEventCalculator
  );

  const reanimatedEvent = Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
