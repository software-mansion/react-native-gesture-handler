import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractStateChangeHandlers } from '../../utils/EventHandlersUtils';
import { getGestureHandlerStateChangeWorkletHandler } from '../GestureHandlerStateChangeWorkletHandler';

export function useReanimatedStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  const callback = getGestureHandlerStateChangeWorkletHandler(
    handlerTag,
    handlers
  );

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
