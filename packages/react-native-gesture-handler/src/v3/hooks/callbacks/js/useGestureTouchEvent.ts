import { extractTouchHandlers } from '../../utils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useGestureTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  return getTouchEventHandler(handlerTag, handlers);
}
