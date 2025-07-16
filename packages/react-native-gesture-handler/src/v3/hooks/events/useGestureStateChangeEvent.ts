import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../../../handlers/gestureHandlerCommon';
import { isStateChangeEvent, runWorklet } from '../utils';
import { State } from '../../../State';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';

export function useGestureStateChangeEvent(
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerStateChange = (
    event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
  ) => {
    'worklet';
    if (!isStateChangeEvent(event)) {
      return;
    }

    const oldState = event.nativeEvent?.oldState ?? event.oldState;
    const state = event.nativeEvent?.state ?? event.state;

    if (oldState === State.UNDETERMINED && state === State.BEGAN) {
      runWorklet(CALLBACK_TYPE.BEGAN, config, event);
    } else if (
      (oldState === State.BEGAN || oldState === State.UNDETERMINED) &&
      state === State.ACTIVE
    ) {
      runWorklet(CALLBACK_TYPE.START, config, event);
    } else if (oldState !== state && state === State.END) {
      if (oldState === State.ACTIVE) {
        runWorklet(CALLBACK_TYPE.END, config, event, true);
      }
      runWorklet(CALLBACK_TYPE.FINALIZE, config, event, true);
    } else if (
      (state === State.FAILED || state === State.CANCELLED) &&
      state !== oldState
    ) {
      if (oldState === State.ACTIVE) {
        runWorklet(CALLBACK_TYPE.END, config, event, false);
      }
      runWorklet(CALLBACK_TYPE.FINALIZE, config, event, false);
    }
  };

  if (shouldUseReanimated) {
    const handlers = {
      onBegin: config.onBegin,
      onStart: config.onStart,
      onEnd: config.onEnd,
      onFinalize: config.onFinalize,
    };

    const { doDependenciesDiffer } = Reanimated!.useHandler(handlers);

    return Reanimated!.useEvent(
      onGestureHandlerStateChange,
      ['onGestureHandlerStateChange'],
      doDependenciesDiffer
    );
  }

  return onGestureHandlerStateChange;
}
