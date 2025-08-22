import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractTouchHandlers } from '../../utils';
import { onGestureHandlerTouchEvent } from '../onGestureHandlerTouchEvent';

export function useReanimatedTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  const callback = onGestureHandlerTouchEvent(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
