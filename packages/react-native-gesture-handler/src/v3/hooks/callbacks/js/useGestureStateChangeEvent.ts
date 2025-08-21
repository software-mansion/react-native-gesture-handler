import { CallbackHandlers } from '../../../types';
import { onGestureHandlerStateChange } from '../onGestureHandlerStateChange';

export function gestureStateChangeEvent(handlerTag: number, config: any) {
  const { onBegin, onStart, onEnd, onFinalize } = config;

  const handlers: CallbackHandlers = {
    ...(onBegin ? { onBegin } : {}),
    ...(onStart ? { onStart } : {}),
    ...(onEnd ? { onEnd } : {}),
    ...(onFinalize ? { onFinalize } : {}),
  };

  return onGestureHandlerStateChange(handlerTag, handlers);
}
