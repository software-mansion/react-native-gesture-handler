import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorkletCallback } from '../utils';
import {
  Reanimated,
  ReanimatedContext,
} from '../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers, UpdateEvent } from '../../types';
import { tagMessage } from '../../../utils';

export function useGestureHandlerEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const handlers: CallbackHandlers = {
    onChange: config.onChange,
    onUpdate: config.onUpdate,
  };

  const onGestureHandlerEvent = (
    event: UpdateEvent<Record<string, unknown>>,
    context: ReanimatedContext | undefined
  ) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    runWorkletCallback(CALLBACK_TYPE.UPDATE, handlers, event);

    // This should never happen, but since we don't want to call hooks conditionally, we have to mark
    // context as possibly undefined to make TypeScript happy.
    if (!context) {
      throw new Error(tagMessage('Event handler context is not defined'));
    }

    if (config.onChange && config.changeEventCalculator) {
      runWorkletCallback(
        CALLBACK_TYPE.CHANGE,
        handlers,
        // @ts-ignore This type comes from old API and should be fixed in the future
        handlers.changeEventCalculator?.(event, context.lastUpdateEvent)
      );

      context.lastUpdateEvent = event;
    }
  };

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  const reanimatedHandler = Reanimated?.useHandler(handlers);
  const reanimatedEvent = Reanimated?.useEvent(
    (event: UpdateEvent<Record<string, unknown>>) => {
      'worklet';
      onGestureHandlerEvent(event, reanimatedHandler?.context);
    },
    ['onGestureHandlerEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return shouldUseReanimated
    ? reanimatedEvent
    : (event: UpdateEvent<Record<string, unknown>>) =>
        onGestureHandlerEvent(event, jsContext);
}
