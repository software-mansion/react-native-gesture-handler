import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractTouchHandlers } from '../../utils';
import { getGestureHandlerTouchEventWorkletHandler } from '../GestureHandlerTouchEventWorkletHandler';

export function useReanimatedTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  const callback = getGestureHandlerTouchEventWorkletHandler(
    handlerTag,
    handlers
  );

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
