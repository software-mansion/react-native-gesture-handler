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

export const GestureStateManager = {
  begin(handlerTag: number): void {
    'worklet';
    setGestureState(handlerTag, State.BEGAN);
  },

  activate(handlerTag: number): void {
    'worklet';
    setGestureState(handlerTag, State.ACTIVE);
  },

  fail(handlerTag: number): void {
    'worklet';
    setGestureState(handlerTag, State.FAILED);
  },

  end(handlerTag: number): void {
    'worklet';
    setGestureState(handlerTag, State.END);
  },
};
