import { extractTouchHandlers } from '../../utils';
import { getGestureHandlerTouchEventWorkletHandler } from '../GestureHandlerTouchEventWorkletHandler';

export function gestureTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  return getGestureHandlerTouchEventWorkletHandler(handlerTag, handlers);
}
