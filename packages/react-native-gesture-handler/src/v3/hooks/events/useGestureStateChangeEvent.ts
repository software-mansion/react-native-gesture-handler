import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorkletCallback } from '../utils';
import { State } from '../../../State';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { StateChangeEvent } from '../../types';
import { GestureStateChangeEvent } from '../../../handlers/gestureHandlerCommon';
import { NativeSyntheticEvent } from 'react-native';

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
      oldState = (event as NativeSyntheticEvent<GestureStateChangeEvent>)
        .nativeEvent.oldState;
      state = (event as NativeSyntheticEvent<GestureStateChangeEvent>)
        .nativeEvent.state;
    } else {
      oldState = (event as GestureStateChangeEvent).oldState;
      state = (event as GestureStateChangeEvent).state;
    }

    if (oldState === State.UNDETERMINED && state === State.BEGAN) {
      runWorkletCallback(CALLBACK_TYPE.BEGAN, config, event);
    } else if (
      (oldState === State.BEGAN || oldState === State.UNDETERMINED) &&
      state === State.ACTIVE
    ) {
      runWorkletCallback(CALLBACK_TYPE.START, config, event);
    } else if (oldState !== state && state === State.END) {
      if (oldState === State.ACTIVE) {
        runWorkletCallback(CALLBACK_TYPE.END, config, event, true);
      }
      runWorkletCallback(CALLBACK_TYPE.FINALIZE, config, event, true);
    } else if (
      (state === State.FAILED || state === State.CANCELLED) &&
      state !== oldState
    ) {
      if (oldState === State.ACTIVE) {
        runWorkletCallback(CALLBACK_TYPE.END, config, event, false);
      }
      runWorkletCallback(CALLBACK_TYPE.FINALIZE, config, event, false);
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
