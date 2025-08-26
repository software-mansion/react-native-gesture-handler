import { isAnimatedEvent } from '../../utils';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';
import { getGestureHandlerEventWorkletHandler } from '../GestureHandlerEventWorkletHandler';
import { extractUpdateHandlers } from '../../utils/EventHandlersUtils';

// eslint-disable-next-line @eslint-react/hooks-extra/ensure-custom-hooks-using-other-hooks
export function useGestureUpdateEvent(handlerTag: number, config: any) {
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
