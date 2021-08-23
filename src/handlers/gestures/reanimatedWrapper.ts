import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';

export interface SharedValue<T> {
  value: T;
}

let Reanimated: {
  default: {
    createAnimatedComponent: (Component: any) => any;
  };
  useEvent: (
    callback: (
      event:
        | UnwrappedGestureHandlerEvent
        | UnwrappedGestureHandlerStateChangeEvent
    ) => void,
    events: string[],
    rebuild: boolean
  ) => unknown;
  useSharedValue: <T>(value: T) => SharedValue<T>;
};

try {
  Reanimated = require('react-native-reanimated');
} catch (e) {
  console.log('RNGH: react-native-reanimated not available');
}

export { Reanimated };
