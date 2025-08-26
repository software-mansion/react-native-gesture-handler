import { extractStateChangeHandlers } from '../../utils/EventHandlersUtils';
import { getGestureHandlerStateChangeWorkletHandler } from '../GestureHandlerStateChangeWorkletHandler';

// eslint-disable-next-line @eslint-react/hooks-extra/ensure-custom-hooks-using-other-hooks
export function useGestureStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  return getGestureHandlerStateChangeWorkletHandler(handlerTag, handlers);
}
