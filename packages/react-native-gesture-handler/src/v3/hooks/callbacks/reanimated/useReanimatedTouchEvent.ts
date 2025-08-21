import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers } from '../../../types';
import { onGestureHandlerTouchEvent } from '../onGestureHandlerTouchEvent';

export function useReanimatedTouchEvent(handlerTag: number, config: any) {
  const { onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancelled } =
    config;

  const handlers: CallbackHandlers = {
    ...(onTouchesDown ? { onTouchesDown } : {}),
    ...(onTouchesMove ? { onTouchesMove } : {}),
    ...(onTouchesUp ? { onTouchesUp } : {}),
    ...(onTouchesCancelled ? { onTouchesCancelled } : {}),
  };

  const callback = onGestureHandlerTouchEvent(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
