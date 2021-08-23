import { ComponentClass } from 'react';
import {
  UnwrappedGestureHandlerEvent,
  UnwrappedGestureHandlerStateChangeEvent,
} from '../gestureHandlerCommon';

export interface SharedValue<T> {
  value: T;
}

let Reanimated: {
  default: {
    createAnimatedComponent<P extends object>(
      component: ComponentClass<P>,
      options?: unknown
    ): ComponentClass<P>;
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
} catch (e) {}

export { Reanimated };
