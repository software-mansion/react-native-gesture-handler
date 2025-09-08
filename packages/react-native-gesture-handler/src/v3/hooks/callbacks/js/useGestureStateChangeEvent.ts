import { BaseGestureConfig } from '../../../types';
import { extractStateChangeHandlers } from '../../utils/eventHandlersUtils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useGestureStateChangeEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const handlers = extractStateChangeHandlers(config);

  return getStateChangeHandler(handlerTag, handlers);
}
