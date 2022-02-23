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

export const GestureStateManager = {
  create(handlerTag: number): GestureStateManagerType {
    'worklet';
    return {
      begin: () => {
        'worklet';
        if (Reanimated) {
          Reanimated.setGestureState(handlerTag, State.BEGAN);
        } else {
          console.warn(warningMessage);
        }
      },

      activate: () => {
        'worklet';
        if (Reanimated) {
          Reanimated.setGestureState(handlerTag, State.ACTIVE);
        } else {
          console.warn(warningMessage);
        }
      },

      fail: () => {
        'worklet';
        if (Reanimated) {
          Reanimated.setGestureState(handlerTag, State.FAILED);
        } else {
          console.warn(warningMessage);
        }
      },

      end: () => {
        'worklet';
        if (Reanimated) {
          Reanimated.setGestureState(handlerTag, State.END);
        } else {
          console.warn(warningMessage);
        }
      },
    };
  },
};
