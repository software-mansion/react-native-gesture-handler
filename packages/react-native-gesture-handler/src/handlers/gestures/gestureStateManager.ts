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
const setGestureState_DEPRECATED = Reanimated?.setGestureState;

// ui runtime global
declare const globalThis: {
  _setGestureStateModern: (handlerTag: number, state: State) => void;
};

const wrappedSetGestureState = (handlerTag: number, state: State) => {
  'worklet';

  if (REANIMATED_AVAILABLE) {
    // When Reanimated is available, setGestureState should be defined
    if (globalThis._setGestureStateModern) {
      globalThis._setGestureStateModern(handlerTag, state);
    } else if (setGestureState_DEPRECATED) {
      setGestureState_DEPRECATED(handlerTag, state);
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
