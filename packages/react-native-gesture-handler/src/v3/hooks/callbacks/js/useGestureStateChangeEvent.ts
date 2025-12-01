import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { prepareStateChangeHandlers } from '../../utils';
import { getStateChangeHandler } from '../stateChangeHandler';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';

export function useGestureStateChangeEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>,
  context: ReanimatedContext<THandlerData>
) {
  return useMemo(() => {
    const handlers = prepareStateChangeHandlers({
      onBegin: config.onBegin,
      onActivate: config.onActivate,
      onDeactivate: config.onDeactivate,
      onFinalize: config.onFinalize,
    });
    return getStateChangeHandler(handlerTag, handlers, context);
  }, [
    handlerTag,
    config.onBegin,
    config.onActivate,
    config.onDeactivate,
    config.onFinalize,
    context,
  ]);
}
