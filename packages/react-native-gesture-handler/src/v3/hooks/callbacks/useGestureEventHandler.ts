import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import {
  BaseGestureConfig,
  GestureCallbacks,
  GestureHandlerEventWithHandlerData,
} from '../../types';
import { useMemo } from 'react';
import { stateMachine } from './stateMachine';

export function useGestureEventHandler<THandlerData, TConfig>(
  handlerTag: number,
  handlers: GestureCallbacks<THandlerData>,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const jsContext: ReanimatedContext<THandlerData> = useMemo(() => {
    return {
      lastUpdateEvent: undefined,
    };
  }, []);

  return useMemo(() => {
    return (event: GestureHandlerEventWithHandlerData<THandlerData>) => {
      stateMachine(
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
