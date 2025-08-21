import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers } from '../../../types';
import { onGestureHandlerStateChange } from '../onGestureHandlerStateChange';

export function useReanimatedStateChangeEvent(handlerTag: number, config: any) {
  const { onBegin, onStart, onEnd, onFinalize } = config;

  const handlers: CallbackHandlers = {
    ...(onBegin ? { onBegin } : {}),
    ...(onStart ? { onStart } : {}),
    ...(onEnd ? { onEnd } : {}),
    ...(onFinalize ? { onFinalize } : {}),
  };

  const callback = onGestureHandlerStateChange(handlerTag, handlers);

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
