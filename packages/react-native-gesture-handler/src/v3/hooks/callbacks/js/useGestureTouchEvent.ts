import { useMemo } from 'react';
import { BaseGestureConfig } from '../../../types';
import { extractTouchHandlers } from '../../utils';
import { getTouchEventHandler } from '../touchEventHandler';

export function useGestureTouchEvent<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return useMemo(() => {
    const handlers = extractTouchHandlers(config);
    return getTouchEventHandler(handlerTag, handlers);
  }, [handlerTag, config]);
}
