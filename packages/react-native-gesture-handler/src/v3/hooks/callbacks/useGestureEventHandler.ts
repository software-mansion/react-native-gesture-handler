import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import {
  BaseGestureConfig,
  GestureCallbacks,
  GestureHandlerEventWithHandlerData,
} from '../../types';
import { useMemo } from 'react';
import { eventHandler } from './eventHandler';

export function useGestureEventHandler<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
) {
  const jsContext: ReanimatedContext<TExtendedHandlerData> = useMemo(() => {
    return {
      lastUpdateEvent: undefined,
    };
  }, []);

  return useMemo(() => {
    return (
      event: GestureHandlerEventWithHandlerData<
        THandlerData,
        TExtendedHandlerData
      >
    ) => {
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
