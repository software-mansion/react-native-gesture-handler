import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { BaseGestureConfig } from '../../../types';
import { prepareTouchHandlers } from '../../utils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useReanimatedTouchEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const handlers = prepareTouchHandlers({
    onTouchesDown: config.onTouchesDown,
    onTouchesMove: config.onTouchesMove,
    onTouchesUp: config.onTouchesUp,
    onTouchesCancelled: config.onTouchesCancelled,
  });

  const callback = getTouchEventHandler(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
