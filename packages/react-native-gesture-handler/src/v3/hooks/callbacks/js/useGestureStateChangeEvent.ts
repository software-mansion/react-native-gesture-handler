import { extractStateChangeHandlers } from '../../utils/eventHandlersUtils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useGestureStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  return getStateChangeHandler(handlerTag, handlers);
}
