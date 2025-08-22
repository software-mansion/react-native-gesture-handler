import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractUpdateHandlers } from '../../utils';
import { onGestureHandlerEvent } from '../onGestureHandlerEvent';

export function useReanimatedUpdateEvent(handlerTag: number, config: any) {
  const { handlers, changeEventCalculator } = extractUpdateHandlers(config);

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
