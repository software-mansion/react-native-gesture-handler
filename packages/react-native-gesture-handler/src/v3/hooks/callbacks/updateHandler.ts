import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { tagMessage } from '../../../utils';
import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers, UpdateEvent } from '../../types';
import { isEventForHandlerWithTag } from '../utils';
import { runCallback } from '../utils/EventHandlersUtils';

export function getUpdateHandler(
  handlerTag: number,
  callbacks: CallbackHandlers,
  context: ReanimatedContext | undefined,
  changeEventCalculator?: (
    current: UpdateEvent<Record<string, unknown>>,
    previous?: UpdateEvent<Record<string, unknown>>
  ) => UpdateEvent<Record<string, unknown>>
) {
  return (event: UpdateEvent<Record<string, unknown>>) => {
    'worklet';

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    // This should never happen, but since we don't want to call hooks conditionally, we have to mark
    // context as possibly undefined to make TypeScript happy.
    if (!context) {
      throw new Error(tagMessage('Event handler context is not defined'));
    }

    runCallback(
      CALLBACK_TYPE.UPDATE,
      callbacks,
      changeEventCalculator
        ? changeEventCalculator(event, context.lastUpdateEvent)
        : event
    );

    // TODO: Investigate why this is always undefined
    context.lastUpdateEvent = event;
  };
}
