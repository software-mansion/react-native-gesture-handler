import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { tagMessage } from '../../../utils';
import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import {
  ChangeCalculatorType,
  GestureCallbacks,
  GestureUpdateEventWithHandlerData,
  UpdateEventWithHandlerData,
} from '../../types';
import {
  flattenAndFilterEvent,
  isEventForHandlerWithTag,
  maybeExtractNativeEvent,
  runCallback,
} from '../utils';

export function getUpdateHandler<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  callbacks: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  context: ReanimatedContext<TExtendedHandlerData> | undefined,
  changeEventCalculator?: ChangeCalculatorType<TExtendedHandlerData>
) {
  return (sourceEvent: UpdateEventWithHandlerData<TExtendedHandlerData>) => {
    'worklet';

    const eventWithData = maybeExtractNativeEvent(
      sourceEvent
    ) as GestureUpdateEventWithHandlerData<TExtendedHandlerData>;

    const eventWithChanges = changeEventCalculator
      ? changeEventCalculator(
          eventWithData,
          context ? context.lastUpdateEvent : undefined
        )
      : eventWithData;

    const event = flattenAndFilterEvent(eventWithChanges);

    if (!isEventForHandlerWithTag(handlerTag, eventWithData)) {
      return;
    }

    // This should never happen, but since we don't want to call hooks conditionally, we have to mark
    // context as possibly undefined to make TypeScript happy.
    if (!context) {
      throw new Error(tagMessage('Event handler context is not defined'));
    }

    runCallback(CALLBACK_TYPE.UPDATE, callbacks, event);

    context.lastUpdateEvent = eventWithData;
  };
}
