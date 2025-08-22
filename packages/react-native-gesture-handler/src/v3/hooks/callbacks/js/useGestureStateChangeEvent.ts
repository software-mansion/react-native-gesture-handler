import { extractStateChangeHandlers } from '../../utils';
import { onGestureHandlerStateChange } from '../onGestureHandlerStateChange';

export function gestureStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  return onGestureHandlerStateChange(handlerTag, handlers);
}
