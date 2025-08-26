import { extractTouchHandlers } from '../../utils';
import { getGestureHandlerTouchEventWorkletHandler } from '../GestureHandlerTouchEventWorkletHandler';

// eslint-disable-next-line @eslint-react/hooks-extra/ensure-custom-hooks-using-other-hooks
export function useGestureTouchEvent(handlerTag: number, config: any) {
  const handlers = extractTouchHandlers(config);

  return getGestureHandlerTouchEventWorkletHandler(handlerTag, handlers);
}
