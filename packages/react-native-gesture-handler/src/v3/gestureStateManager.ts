import { State } from '../State';
import { tagMessage } from '../utils';

export type GestureStateManagerType = {
  begin(handlerTag: number): void;
  activate(handlerTag: number): void;
  fail(handlerTag: number): void;
  deactivate(handlerTag: number): void;
};

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

export const GestureStateManager: GestureStateManagerType = {
  begin(handlerTag: number) {
    'worklet';
    setGestureState(handlerTag, State.BEGAN);
  },

  activate(handlerTag: number) {
    'worklet';
    setGestureState(handlerTag, State.ACTIVE);
  },

  fail(handlerTag: number) {
    'worklet';
    setGestureState(handlerTag, State.FAILED);
  },

  deactivate(handlerTag: number) {
    'worklet';
    setGestureState(handlerTag, State.END);
  },
};
