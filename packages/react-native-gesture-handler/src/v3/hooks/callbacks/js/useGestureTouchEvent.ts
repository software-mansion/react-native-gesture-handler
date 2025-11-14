import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { prepareTouchHandlers } from '../../utils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useGestureTouchEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return useMemo(() => {
    const handlers = prepareTouchHandlers({
      onTouchesDown: config.onTouchesDown,
      onTouchesMove: config.onTouchesMove,
      onTouchesUp: config.onTouchesUp,
      onTouchesCancel: config.onTouchesCancel,
    });
    return getTouchEventHandler(handlerTag, handlers);
  }, [
    handlerTag,
    config.onTouchesDown,
    config.onTouchesMove,
    config.onTouchesUp,
    config.onTouchesCancel,
  ]);
}
