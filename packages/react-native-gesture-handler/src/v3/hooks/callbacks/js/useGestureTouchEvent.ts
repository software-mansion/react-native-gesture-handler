import { BaseGestureConfig } from '../../../types';
import { extractTouchHandlers } from '../../utils/eventHandlersUtils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useGestureTouchEvent(
  handlerTag: number,
  config: BaseGestureConfig<unknown>
) {
  const handlers = extractTouchHandlers(config);

  return getTouchEventHandler(handlerTag, handlers);
}
