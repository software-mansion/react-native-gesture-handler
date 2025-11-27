import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { prepareStateChangeHandlers } from '../../utils';
import { getStateChangeHandler } from '../stateChangeHandler';
import { ReanimatedContext } from 'packages/react-native-gesture-handler/src/handlers/gestures/reanimatedWrapper';

export function useGestureStateChangeEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>,
  context: ReanimatedContext<THandlerData>
) {
  return useMemo(() => {
    const handlers = prepareStateChangeHandlers({
      onBegin: config.onBegin,
      onStart: config.onStart,
      onEnd: config.onEnd,
      onFinalize: config.onFinalize,
    });
    return getStateChangeHandler(handlerTag, handlers, context);
  }, [
    handlerTag,
    config.onBegin,
    config.onStart,
    config.onEnd,
    config.onFinalize,
    context,
  ]);
}
