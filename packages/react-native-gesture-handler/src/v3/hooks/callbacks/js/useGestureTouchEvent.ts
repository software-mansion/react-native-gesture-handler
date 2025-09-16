import { BaseGestureConfig } from '../../../types';
import { extractTouchHandlers } from '../../utils/eventHandlersUtils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useGestureTouchEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const handlers = extractTouchHandlers(config);

  return getTouchEventHandler(handlerTag, handlers);
}
