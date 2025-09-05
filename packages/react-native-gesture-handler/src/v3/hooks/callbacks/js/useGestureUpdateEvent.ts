import { isAnimatedEvent } from '../../utils';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractUpdateHandlers } from '../../utils/eventHandlersUtils';
import { getUpdateHandler } from '../updateHandler';
import { BaseGestureConfig } from '../../../types';

export function useGestureUpdateEvent(
  handlerTag: number,
  config: BaseGestureConfig<unknown>
) {
  const { handlers, changeEventCalculator } = extractUpdateHandlers(config);

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  return isAnimatedEvent(config.onUpdate)
    ? undefined
    : getUpdateHandler(handlerTag, handlers, jsContext, changeEventCalculator);
}
