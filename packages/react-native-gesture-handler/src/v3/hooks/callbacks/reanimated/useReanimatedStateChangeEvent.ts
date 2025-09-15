import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractStateChangeHandlers } from '../../utils/eventHandlersUtils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useReanimatedStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  const callback = getStateChangeHandler(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
