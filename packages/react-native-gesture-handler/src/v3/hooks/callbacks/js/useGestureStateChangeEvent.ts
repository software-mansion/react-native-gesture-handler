import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { extractStateChangeHandlers } from '../../utils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useGestureStateChangeEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return useMemo(() => {
    const handlers = extractStateChangeHandlers(config);
    return getStateChangeHandler(handlerTag, handlers);
  }, [handlerTag, config]);
}
