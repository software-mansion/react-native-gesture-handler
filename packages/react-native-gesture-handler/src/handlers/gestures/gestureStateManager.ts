import { State } from '../../State';
import { tagMessage } from '../../utils';

export interface GestureStateManagerType {
  begin: () => void;
  activate: () => void;
  fail: () => void;
  end: () => void;
  /** @internal */
  handlerTag: number;
}

const wrappedSetGestureState = (handlerTag: number, state: State) => {
  'worklet';

  if (globalThis._setGestureStateSync) {
    globalThis._setGestureStateSync(handlerTag, state);
  } else if (globalThis._setGestureStateAsync) {
    globalThis._setGestureStateAsync(handlerTag, state);
  } else {
    throw new Error(tagMessage('Failed to set gesture state'));
  }
};

function create(handlerTag: number): GestureStateManagerType {
  'worklet';
  return {
    handlerTag,

    begin: () => {
      'worklet';
      wrappedSetGestureState(handlerTag, State.BEGAN);
    },

    activate: () => {
      'worklet';
      wrappedSetGestureState(handlerTag, State.ACTIVE);
    },

    fail: () => {
      'worklet';
      wrappedSetGestureState(handlerTag, State.FAILED);
    },

    end: () => {
      'worklet';
      wrappedSetGestureState(handlerTag, State.END);
    },
  };
}

export const GestureStateManager = {
  create,
};
