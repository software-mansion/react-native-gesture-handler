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
  isEventForHandlerWithTag,
  maybeExtractNativeEvent,
  runCallback,
} from '../utils';

export function getUpdateHandler<THandlerData>(
  handlerTag: number,
  callbacks: GestureCallbacks<THandlerData>,
  context: ReanimatedContext<THandlerData> | undefined,
  changeEventCalculator?: ChangeCalculatorType<THandlerData>
) {
  return (sourceEvent: UpdateEventWithHandlerData<THandlerData>) => {
    'worklet';

    const event = maybeExtractNativeEvent(
      sourceEvent
    ) as GestureUpdateEventWithHandlerData<THandlerData>;

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

    context.lastUpdateEvent = event;
  };
}
