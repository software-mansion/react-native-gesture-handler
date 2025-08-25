import { extractUpdateHandlers, isAnimatedEvent } from '../../utils';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';
import { getGestureHandlerEventWorkletHandler } from '../GestureHandlerEventWorkletHandler';

export function gestureUpdateEvent(handlerTag: number, config: any) {
  const { handlers, changeEventCalculator } = extractUpdateHandlers(config);

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  return isAnimatedEvent(config.onUpdate)
    ? undefined
    : getGestureHandlerEventWorkletHandler(
        handlerTag,
        handlers,
        jsContext,
        changeEventCalculator
      );
}
