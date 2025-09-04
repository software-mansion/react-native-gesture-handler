import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractTouchHandlers } from '../../utils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useReanimatedTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  const callback = getTouchEventHandler(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
