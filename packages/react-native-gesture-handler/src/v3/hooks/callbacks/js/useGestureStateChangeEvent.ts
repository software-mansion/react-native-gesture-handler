import { BaseGestureConfig } from '../../../types';
import { extractStateChangeHandlers } from '../../utils/eventHandlersUtils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useGestureStateChangeEvent(
  handlerTag: number,
  config: BaseGestureConfig<unknown>
) {
  const handlers = extractStateChangeHandlers(config);

  return getStateChangeHandler(handlerTag, handlers);
}
