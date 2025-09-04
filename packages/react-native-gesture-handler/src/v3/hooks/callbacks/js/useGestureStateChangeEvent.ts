import { extractStateChangeHandlers } from '../../utils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useGestureStateChangeEvent(handlerTag: number, config: any) {
  const handlers = extractStateChangeHandlers(config);

  return getStateChangeHandler(handlerTag, handlers);
}
