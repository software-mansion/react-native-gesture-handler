import { ComponentClass, Context } from 'react';
import { tagMessage } from '../../utils';
import { GestureHandlerEvent } from '../../v3/interfaces';

export interface SharedValue<T> {
  value: T;
}

let Reanimated:
  | {
      default: {
        // Slightly modified definition copied from 'react-native-reanimated'
        createAnimatedComponent<P extends object>(
          component: ComponentClass<P>,
          options?: unknown
        ): ComponentClass<P>;
      };
      useHandler: (handlers: Record<string, unknown>) => {
        doDependenciesDiffer: boolean;
      };
      useEvent: <T>(
        callback: (event: T) => void,
        events: string[],
        rebuild: boolean
      ) => (event: GestureHandlerEvent, context?: Context<unknown>) => void;
      useSharedValue: <T>(value: T) => SharedValue<T>;
      setGestureState: (handlerTag: number, newState: number) => void;
      isSharedValue: (value: unknown) => value is SharedValue<unknown>;
    }
  | undefined;

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
