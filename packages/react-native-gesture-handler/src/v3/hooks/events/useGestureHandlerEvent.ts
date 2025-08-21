import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  isAnimatedEvent,
  isEventForHandlerWithTag,
  runWorkletCallback,
} from '../utils';
import {
  Reanimated,
  ReanimatedContext,
} from '../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers, UpdateEvent } from '../../types';
import { tagMessage } from '../../../utils';

export function useGestureHandlerEvent(handlerTag: number, config: any) {
  const { onUpdate } = config;

  const handlers: CallbackHandlers = { ...(onUpdate && { onUpdate }) };

  const onGestureHandlerEvent = (
    event: UpdateEvent<Record<string, unknown>>,
    context: ReanimatedContext | undefined
  ) => {
    'worklet';

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    // This should never happen, but since we don't want to call hooks conditionally, we have to mark
    // context as possibly undefined to make TypeScript happy.
    if (!context) {
      throw new Error(tagMessage('Event handler context is not defined'));
    }

    runWorkletCallback(
      CALLBACK_TYPE.UPDATE,
      handlers,
      config.changeEventCalculator
        ? config.changeEventCalculator(event, context.lastUpdateEvent)
        : event
    );

    // TODO: Investigate why this is always undefined
    context.lastUpdateEvent = event;
  };

  const jsContext: ReanimatedContext = {
    lastUpdateEvent: undefined,
  };

  if (config.disableReanimated) {
    return isAnimatedEvent(config.onUpdate)
      ? undefined
      : (event: UpdateEvent<Record<string, unknown>>) =>
          onGestureHandlerEvent(event, jsContext);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reanimatedHandler = Reanimated?.useHandler(handlers);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reanimatedEvent = Reanimated?.useEvent(
    (event: UpdateEvent<Record<string, unknown>>) => {
      'worklet';
      onGestureHandlerEvent(event, reanimatedHandler?.context);
    },
    ['onGestureHandlerReanimatedEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return isAnimatedEvent(config.onUpdate)
    ? undefined
    : config.shouldUseReanimated
      ? reanimatedEvent
      : (event: UpdateEvent<Record<string, unknown>>) =>
          onGestureHandlerEvent(event, jsContext);
}
