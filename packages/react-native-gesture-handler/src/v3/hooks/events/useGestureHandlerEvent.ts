import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorkletCallback } from '../utils';
import {
  Reanimated,
  ReanimatedContext,
} from '../../../handlers/gestures/reanimatedWrapper';
import { UpdateEvent } from '../../types';
import { tagMessage } from '../../../utils';

export function useGestureHandlerEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerEvent = (
    event: UpdateEvent,
    context: ReanimatedContext | undefined
  ) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    runWorkletCallback(CALLBACK_TYPE.UPDATE, config, event);

    // This should never happen, but since we don't want to call hooks conditionally, we have to mark
    // context as possibly undefined to make TypeScript happy.
    if (!context) {
      throw new Error(tagMessage('Event handler context is not defined'));
    }

    if (config.onChange && config.changeEventCalculator) {
      runWorkletCallback(
        CALLBACK_TYPE.CHANGE,
        config,
        config.changeEventCalculator?.(event, context.lastUpdateEvent)
      );

      context.lastUpdateEvent = event;
    }
  };

  const handlers = {
    onChange: config.onChange,
    onUpdate: config.onUpdate,
  };

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  const reanimatedHandler = Reanimated?.useHandler(handlers);
  const reanimatedEvent = Reanimated?.useEvent(
    (event: UpdateEvent) => {
      'worklet';
      onGestureHandlerEvent(event, reanimatedHandler?.context);
    },
    ['onGestureHandlerEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return shouldUseReanimated
    ? reanimatedEvent
    : (event: UpdateEvent) => onGestureHandlerEvent(event, jsContext);
}
