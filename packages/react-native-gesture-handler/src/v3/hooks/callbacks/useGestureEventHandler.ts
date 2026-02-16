import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import {
  BaseGestureConfig,
  GestureCallbacks,
  GestureHandlerEventWithHandlerData,
} from '../../types';
import { useMemo } from 'react';
import { eventHandler } from './eventHandler';

export function useGestureEventHandler<TBaseHandlerData, THandlerData, TConfig>(
  handlerTag: number,
  handlers: GestureCallbacks<TBaseHandlerData, THandlerData>,
  config: BaseGestureConfig<TBaseHandlerData, THandlerData, TConfig>
) {
  const jsContext: ReanimatedContext<THandlerData> = useMemo(() => {
    return {
      lastUpdateEvent: undefined,
    };
  }, []);

  return useMemo(() => {
    return (event: GestureHandlerEventWithHandlerData<THandlerData>) => {
      eventHandler(
        handlerTag,
        event,
        handlers,
        config.changeEventCalculator,
        jsContext,
        !!config.dispatchesAnimatedEvents
      );
    };
  }, [
    handlerTag,
    handlers,
    config.changeEventCalculator,
    config.dispatchesAnimatedEvents,
    jsContext,
  ]);
}
