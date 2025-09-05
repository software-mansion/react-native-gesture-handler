import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { BaseGestureConfig } from '../../../types';
import { extractTouchHandlers } from '../../utils/eventHandlersUtils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useReanimatedTouchEvent(
  handlerTag: number,
  config: BaseGestureConfig<unknown>
) {
  const handlers = extractTouchHandlers(config);

  const callback = getTouchEventHandler(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
