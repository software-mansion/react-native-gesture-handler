import { ReanimatedContext } from 'packages/react-native-gesture-handler/src/handlers/gestures/reanimatedWrapper';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { State } from '../../../State';
import {
  GestureCallbacks,
  GestureStateChangeEventWithHandlerData,
  StateChangeEventWithHandlerData,
} from '../../types';
import {
  flattenAndFilterEvent,
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
    const event = flattenAndFilterEvent(eventWithData);

    if (!isEventForHandlerWithTag(handlerTag, eventWithData)) {
      return;
    }

    const { state, oldState } = eventWithData;

    if (oldState === State.UNDETERMINED && state === State.BEGAN) {
      runCallback(CALLBACK_TYPE.BEGAN, callbacks, event);
    } else if (
      (oldState === State.BEGAN || oldState === State.UNDETERMINED) &&
      state === State.ACTIVE
    ) {
      runCallback(CALLBACK_TYPE.START, callbacks, event);
    } else if (oldState !== state && state === State.END) {
      if (oldState === State.ACTIVE) {
        runCallback(CALLBACK_TYPE.END, callbacks, event, true);
      }
      runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, true);

      if (context) {
        context.lastUpdateEvent = undefined;
      }
    } else if (
      (state === State.FAILED || state === State.CANCELLED) &&
      state !== oldState
    ) {
      if (oldState === State.ACTIVE) {
        runCallback(CALLBACK_TYPE.END, callbacks, event, false);
      }
      runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, false);

      if (context) {
        context.lastUpdateEvent = undefined;
      }
    }
  };
}
