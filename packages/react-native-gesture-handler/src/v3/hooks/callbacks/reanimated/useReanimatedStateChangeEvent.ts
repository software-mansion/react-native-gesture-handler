import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { BaseGestureConfig } from '../../../types';
import { prepareStateChangeHandlers } from '../../utils';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useReanimatedStateChangeEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const handlers = prepareStateChangeHandlers({
    onBegin: config.onBegin,
    onStart: config.onStart,
    onEnd: config.onEnd,
    onFinalize: config.onFinalize,
  });

  const callback = getStateChangeHandler(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
