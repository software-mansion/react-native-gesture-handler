import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { prepareStateChangeHandlers } from '../../utils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useGestureStateChangeEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return useMemo(() => {
    const handlers = prepareStateChangeHandlers({
      onBegin: config.onBegin,
      onStart: config.onStart,
      onEnd: config.onEnd,
      onFinalize: config.onFinalize,
    });
    return getStateChangeHandler(handlerTag, handlers);
  }, [
    handlerTag,
    config.onBegin,
    config.onStart,
    config.onEnd,
    config.onFinalize,
  ]);
}
