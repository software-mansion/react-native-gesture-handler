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

export function getUpdateHandler<TBaseHandlerData, THandlerData>(
  handlerTag: number,
  callbacks: GestureCallbacks<TBaseHandlerData, THandlerData>,
  context: ReanimatedContext<THandlerData> | undefined,
  changeEventCalculator?: ChangeCalculatorType<THandlerData>
) {
  return (sourceEvent: UpdateEventWithHandlerData<THandlerData>) => {
    'worklet';

    const eventWithData = maybeExtractNativeEvent(
      sourceEvent
    ) as GestureUpdateEventWithHandlerData<THandlerData>;

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
