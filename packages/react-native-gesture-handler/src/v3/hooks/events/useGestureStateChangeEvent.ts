import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  isEventForHandlerWithTag,
  isNativeEvent,
  runWorkletCallback,
} from '../utils';
import { State } from '../../../State';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { CallbackHandlers, StateChangeEvent } from '../../types';

export function useGestureStateChangeEvent(handlerTag: number, config: any) {
  const handlers: CallbackHandlers = {};

  if (config.onBegin) {
    handlers.onBegin = config.onBegin;
  }
  if (config.onStart) {
    handlers.onStart = config.onStart;
  }
  if (config.onEnd) {
    handlers.onEnd = config.onEnd;
  }
  if (config.onFinalize) {
    handlers.onFinalize = config.onFinalize;
  }

  const onGestureHandlerStateChange = (
    event: StateChangeEvent<Record<string, unknown>>
  ) => {
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
      runWorkletCallback(CALLBACK_TYPE.BEGAN, handlers, event);
    } else if (
      (oldState === State.BEGAN || oldState === State.UNDETERMINED) &&
      state === State.ACTIVE
    ) {
      runWorkletCallback(CALLBACK_TYPE.START, handlers, event);
    } else if (oldState !== state && state === State.END) {
      if (oldState === State.ACTIVE) {
        runWorkletCallback(CALLBACK_TYPE.END, handlers, event, true);
      }
      runWorkletCallback(CALLBACK_TYPE.FINALIZE, handlers, event, true);
    } else if (
      (state === State.FAILED || state === State.CANCELLED) &&
      state !== oldState
    ) {
      if (oldState === State.ACTIVE) {
        runWorkletCallback(CALLBACK_TYPE.END, handlers, event, false);
      }
      runWorkletCallback(CALLBACK_TYPE.FINALIZE, handlers, event, false);
    }
  };

  if (config.disableReanimated) {
    return onGestureHandlerStateChange;
  }

  console.log(handlers);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reanimatedHandler = Reanimated?.useHandler(handlers);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reanimatedEvent = Reanimated?.useEvent(
    onGestureHandlerStateChange,
    ['onGestureHandlerStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return config.shouldUseReanimated
    ? reanimatedEvent
    : onGestureHandlerStateChange;
}
