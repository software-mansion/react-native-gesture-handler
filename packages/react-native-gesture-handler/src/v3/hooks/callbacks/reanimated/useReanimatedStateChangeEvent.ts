import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractStateChangeHandlers } from '../../utils';
import { onGestureHandlerStateChange } from '../onGestureHandlerStateChange';

export function useReanimatedStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  const callback = onGestureHandlerStateChange(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
