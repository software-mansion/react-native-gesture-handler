import { extractStateChangeHandlers } from '../../utils';
import { getGestureHandlerStateChangeWorkletHandler } from '../GestureHandlerStateChangeWorkletHandler';

export function gestureStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  return getGestureHandlerStateChangeWorkletHandler(handlerTag, handlers);
}
