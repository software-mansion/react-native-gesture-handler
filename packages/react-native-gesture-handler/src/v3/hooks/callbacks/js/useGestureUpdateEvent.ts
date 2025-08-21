import { isAnimatedEvent } from '../../utils';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers } from '../../../types';
import { onGestureHandlerEvent } from '../onGestureHandlerEvent';

export function gestureUpdateEvent(handlerTag: number, config: any) {
  const { onUpdate, changeEventCalculator } = config;

  const handlers: CallbackHandlers = { ...(onUpdate ? { onUpdate } : {}) };

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  return isAnimatedEvent(config.onUpdate)
    ? undefined
    : onGestureHandlerEvent(
        handlerTag,
        handlers,
        jsContext,
        changeEventCalculator
      );
}
