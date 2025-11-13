import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { ensureTouchHandlers } from '../../utils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useGestureTouchEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return useMemo(() => {
    const handlers = ensureTouchHandlers({
      onTouchesDown: config.onTouchesDown,
      onTouchesMove: config.onTouchesMove,
      onTouchesUp: config.onTouchesUp,
      onTouchesCancelled: config.onTouchesCancelled,
    });
    return getTouchEventHandler(handlerTag, handlers);
  }, [
    handlerTag,
    config.onTouchesDown,
    config.onTouchesMove,
    config.onTouchesUp,
    config.onTouchesCancelled,
  ]);
}
