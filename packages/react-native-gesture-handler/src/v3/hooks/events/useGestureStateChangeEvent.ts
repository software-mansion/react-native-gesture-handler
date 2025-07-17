import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorklet } from '../utils';
import { State } from '../../../State';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { EventWithNativeEvent, StateChangeEvent } from '../../interfaces';
import { GestureStateChangeEvent } from '../../../handlers/gestureHandlerCommon';

export function useGestureStateChangeEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerStateChange = (event: StateChangeEvent) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    let oldState: State | undefined;
    let state: State | undefined;

    if (event.nativeEvent) {
      oldState = (event as EventWithNativeEvent<GestureStateChangeEvent>)
        .nativeEvent.oldState;
      state = (event as EventWithNativeEvent<GestureStateChangeEvent>)
        .nativeEvent.state;
    } else {
      oldState = (event as GestureStateChangeEvent).oldState;
      state = (event as GestureStateChangeEvent).state;
    }

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
