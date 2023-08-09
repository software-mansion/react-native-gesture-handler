import { ComponentClass } from 'react';
import {
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from '../gestureHandlerCommon';
import { tagMessage } from '../../utils';

export interface SharedValue<T> {
  value: T;
}

let Reanimated: {
  default: {
    // Slightly modified definition copied from 'react-native-reanimated'
    // eslint-disable-next-line @typescript-eslint/ban-types
    createAnimatedComponent<P extends object>(
      component: ComponentClass<P>,
      options?: unknown
    ): ComponentClass<P>;
  };
  useEvent: (
    callback: (event: GestureUpdateEvent | GestureStateChangeEvent) => void,
    events: string[],
    rebuild: boolean
  ) => unknown;
  useSharedValue: <T>(value: T) => SharedValue<T>;
  setGestureState: (handlerTag: number, newState: number) => void;
};

try {
  Reanimated = require('react-native-reanimated');
} catch (e) {
  // When 'react-native-reanimated' is not available we want to quietly continue
  // @ts-ignore TS demands the variable to be initialized
  Reanimated = undefined;
}

if (!Reanimated?.useSharedValue) {
  // @ts-ignore Make sure the loaded module is actually Reanimated, if it's not
  // reset the module to undefined so we can fallback to the default implementation
  Reanimated = undefined;
}

if (Reanimated !== undefined && !Reanimated.setGestureState) {
  // The loaded module is Reanimated but it doesn't have the setGestureState defined
  Reanimated.setGestureState = () => {
    'worklet';
    console.warn(
      tagMessage(
        'Please use newer version of react-native-reanimated in order to control state of the gestures.'
      )
    );
  };
}

export { Reanimated };
