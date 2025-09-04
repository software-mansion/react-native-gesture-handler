import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { State } from '../../../State';
import { CallbackHandlers, StateChangeEvent } from '../../types';
import { isEventForHandlerWithTag, isNativeEvent } from '../utils';
import { runCallback } from '../utils/EventHandlersUtils';

export function getStateChangeHandler(
  handlerTag: number,
  callbacks: CallbackHandlers
) {
  return (event: StateChangeEvent<Record<string, unknown>>) => {
    'worklet';

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    let oldState: State | undefined;
    let state: State | undefined;

    if (isNativeEvent(event)) {
      oldState = event.nativeEvent.oldState;
      state = event.nativeEvent.state;
    } else {
      oldState = event.oldState;
      state = event.state;
    }

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
    } else if (
      (state === State.FAILED || state === State.CANCELLED) &&
      state !== oldState
    ) {
      if (oldState === State.ACTIVE) {
        runCallback(CALLBACK_TYPE.END, callbacks, event, false);
      }
      runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, false);
    }
  };
}
