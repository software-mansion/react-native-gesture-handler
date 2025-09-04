import { extractTouchHandlers } from '../../utils';
import { getGestureHandlerTouchEventWorkletHandler } from '../GestureHandlerTouchEventWorkletHandler';

export function useGestureTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  return getGestureHandlerTouchEventWorkletHandler(handlerTag, handlers);
}
