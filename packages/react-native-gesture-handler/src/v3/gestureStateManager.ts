import { State } from '../State';
import { tagMessage } from '../utils';

const setGestureState = (handlerTag: number, state: State) => {
  'worklet';

  if (globalThis._setGestureStateSync) {
    globalThis._setGestureStateSync(handlerTag, state);
  } else if (globalThis._setGestureStateAsync) {
    globalThis._setGestureStateAsync(handlerTag, state);
  } else {
    throw new Error(tagMessage('Failed to set gesture state'));
  }
};

export const begin = (handlerTag: number): void => {
  'worklet';
  setGestureState(handlerTag, State.BEGAN);
};

export const activate = (handlerTag: number): void => {
  'worklet';
  setGestureState(handlerTag, State.ACTIVE);
};

export const fail = (handlerTag: number): void => {
  'worklet';
  setGestureState(handlerTag, State.FAILED);
};

export const end = (handlerTag: number): void => {
  'worklet';
  setGestureState(handlerTag, State.END);
};
