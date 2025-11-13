import { ensureUpdateHandlers, isAnimatedEvent } from '../../utils';
import { ReanimatedContext } from '../../../../handlers/gestures/reanimatedWrapper';
import { getUpdateHandler } from '../updateHandler';
import { BaseGestureConfig } from '../../../types';
import { useMemo } from 'react';

export function useGestureUpdateEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return useMemo(() => {
    const { handlers, changeEventCalculator } = ensureUpdateHandlers(
      {
        onUpdate: config.onUpdate,
      },
      config.changeEventCalculator
    );

    const jsContext: ReanimatedContext<THandlerData> = {
      lastUpdateEvent: undefined,
    };

    return isAnimatedEvent(config.onUpdate)
      ? undefined
      : getUpdateHandler(
          handlerTag,
          handlers,
          jsContext,
          changeEventCalculator
        );
  }, [handlerTag, config.onUpdate, config.changeEventCalculator]);
}
