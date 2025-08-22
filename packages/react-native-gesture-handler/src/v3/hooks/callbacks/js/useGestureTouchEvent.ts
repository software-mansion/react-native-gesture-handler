import { extractTouchHandlers } from '../../utils';
import { onGestureHandlerTouchEvent } from '../onGestureHandlerTouchEvent';

export function gestureTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  return onGestureHandlerTouchEvent(handlerTag, handlers);
}
