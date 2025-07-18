import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorkletCallback } from '../utils';
import {
  Reanimated,
  ReanimatedContext,
} from '../../../handlers/gestures/reanimatedWrapper';
import { UpdateEvent } from '../../types';

export function useGestureHandlerEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerEvent = (
    event: UpdateEvent,
    context: ReanimatedContext
  ) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    runWorkletCallback(CALLBACK_TYPE.UPDATE, config, event);

    if (config.onChange && config.changeEventCalculator) {
      runWorkletCallback(
        CALLBACK_TYPE.CHANGE,
        config,
        config.changeEventCalculator?.(event, context.lastUpdateEvent)
      );

      context.lastUpdateEvent = event;
    }
  };

  if (shouldUseReanimated) {
    const handlers = {
      onChange: config.onChange,
      onUpdate: config.onUpdate,
    };

    const { doDependenciesDiffer, context } = Reanimated!.useHandler(handlers);

    return Reanimated!.useEvent(
      (event: UpdateEvent) => {
        'worklet';
        onGestureHandlerEvent(event, context);
      },
      ['onGestureHandlerEvent'],
      doDependenciesDiffer
    );
  } else {
    const context: ReanimatedContext = {
      lastUpdateEvent: undefined,
    };

    return (event: UpdateEvent) => onGestureHandlerEvent(event, context);
  }
}
