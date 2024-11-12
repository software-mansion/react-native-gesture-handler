import { Reanimated } from './reanimatedWrapper';
import { State } from '../../State';
import { tagMessage } from '../../utils';

export interface GestureStateManagerType {
  begin: () => void;
  activate: () => void;
  fail: () => void;
  end: () => void;
}

const warningMessage = tagMessage(
  'react-native-reanimated is required in order to use synchronous state management'
);

// Check if reanimated module is available, but look for useSharedValue as conditional
// require of reanimated can sometimes return content of `utils.ts` file (?)
const REANIMATED_AVAILABLE = Reanimated?.useSharedValue !== undefined;
const setGestureState = Reanimated?.setGestureState;

// ui runtime global
declare const global: {
  _setGestureStateNew: (handlerTag: number, state: State) => void;
};

const wrappedSetGestureState = (handlerTag: number, state: State) => {
  'worklet';

  if (REANIMATED_AVAILABLE) {
    // When Reanimated is available, setGestureState should be defined
    if (global._setGestureStateNew) {
      global._setGestureStateNew(handlerTag, state);
    } else if (setGestureState) {
      setGestureState(handlerTag, state);
    }
  } else {
    console.warn(warningMessage);
  }
};

function create(handlerTag: number): GestureStateManagerType {
  'worklet';
  return {
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
