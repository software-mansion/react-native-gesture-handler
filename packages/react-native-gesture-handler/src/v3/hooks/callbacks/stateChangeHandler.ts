import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { State } from '../../../State';
import {
  GestureCallbacks,
  GestureStateChangeEventWithHandlerData,
  StateChangeEventWithHandlerData,
} from '../../types';
import {
  flattenEvent,
  isEventForHandlerWithTag,
  maybeExtractNativeEvent,
  runCallback,
} from '../utils';

export function getStateChangeHandler<THandlerData>(
  handlerTag: number,
  callbacks: GestureCallbacks<THandlerData>,
  context?: ReanimatedContext<THandlerData>
) {
  return (sourceEvent: StateChangeEventWithHandlerData<THandlerData>) => {
    'worklet';

    const eventWithData = maybeExtractNativeEvent(
      sourceEvent
    ) as GestureStateChangeEventWithHandlerData<THandlerData>;
    const event = flattenEvent(eventWithData);

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    if (event.oldState === State.UNDETERMINED && event.state === State.BEGAN) {
      runCallback(CALLBACK_TYPE.BEGAN, callbacks, event);
    } else if (
      (event.oldState === State.BEGAN ||
        event.oldState === State.UNDETERMINED) &&
      event.state === State.ACTIVE
    ) {
      runCallback(CALLBACK_TYPE.START, callbacks, event);
    } else if (event.oldState !== event.state && event.state === State.END) {
      if (event.oldState === State.ACTIVE) {
        runCallback(CALLBACK_TYPE.END, callbacks, event, true);
      }
      runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, true);

      if (context) {
        context.lastUpdateEvent = undefined;
      }
    } else if (
      (event.state === State.FAILED || event.state === State.CANCELLED) &&
      event.state !== event.oldState
    ) {
      if (event.oldState === State.ACTIVE) {
        runCallback(CALLBACK_TYPE.END, callbacks, event, false);
      }
      runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, false);

      if (context) {
        context.lastUpdateEvent = undefined;
      }
    }
  };
}
