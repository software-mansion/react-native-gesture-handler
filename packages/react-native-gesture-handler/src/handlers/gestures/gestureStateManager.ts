import { Reanimated } from './reanimatedWrapper';
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

const warningMessage = tagMessage(
  'react-native-reanimated is required in order to use synchronous state management'
);

// Check if reanimated module is available, but look for useSharedValue as conditional
// require of reanimated can sometimes return content of `utils.ts` file (?)
const REANIMATED_AVAILABLE = Reanimated?.useSharedValue !== undefined;
const setGestureState = Reanimated?.setGestureState;

function create(handlerTag: number): GestureStateManagerType {
  'worklet';
  return {
    handlerTag,

    begin: () => {
      'worklet';
      if (REANIMATED_AVAILABLE) {
        // When Reanimated is available, setGestureState should be defined
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setGestureState!(handlerTag, State.BEGAN);
      } else {
        console.warn(warningMessage);
      }
    },

    activate: () => {
      'worklet';
      if (REANIMATED_AVAILABLE) {
        // When Reanimated is available, setGestureState should be defined
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setGestureState!(handlerTag, State.ACTIVE);
      } else {
        console.warn(warningMessage);
      }
    },

    fail: () => {
      'worklet';
      if (REANIMATED_AVAILABLE) {
        // When Reanimated is available, setGestureState should be defined
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setGestureState!(handlerTag, State.FAILED);
      } else {
        console.warn(warningMessage);
      }
    },

    end: () => {
      'worklet';
      if (REANIMATED_AVAILABLE) {
        // When Reanimated is available, setGestureState should be defined
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setGestureState!(handlerTag, State.END);
      } else {
        console.warn(warningMessage);
      }
    },
  };
}

export const GestureStateManager = {
  create,
};
