import { extractUpdateHandlers, isAnimatedEvent } from '../../utils';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';
import { getUpdateHandler } from '../updateHandler';

export function useGestureUpdateEvent(handlerTag: number, config: any) {
  const { handlers, changeEventCalculator } = extractUpdateHandlers(config);

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  return isAnimatedEvent(config.onUpdate)
    ? undefined
    : getUpdateHandler(handlerTag, handlers, jsContext, changeEventCalculator);
}
