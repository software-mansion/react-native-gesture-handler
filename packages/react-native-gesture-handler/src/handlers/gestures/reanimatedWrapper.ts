import { ComponentClass } from 'react';
import { tagMessage } from '../../utils';
import { GestureCallbacks, GestureUpdateEvent } from '../../v3/types';

export interface SharedValue<Value = unknown> {
  value: Value;
  get(): Value;
  set(value: Value | ((value: Value) => Value)): void;
  addListener: (listenerID: number, listener: (value: Value) => void) => void;
  removeListener: (listenerID: number) => void;
  modify: (
    modifier?: <T extends Value>(value: T) => T,
    forceUpdate?: boolean
  ) => void;
}

export type ReanimatedContext<THandlerData> = {
  lastUpdateEvent: GestureUpdateEvent<THandlerData> | undefined;
};

interface WorkletProps {
  __closure: unknown;
  __workletHash: number;
  __initData?: unknown;
  __init?: () => unknown;
  __stackDetails?: unknown;
  __pluginVersion?: string;
}

type WorkletFunction<
  TArgs extends unknown[] = unknown[],
  TReturn = unknown,
> = ((...args: TArgs) => TReturn) & WorkletProps;

let Reanimated:
  | {
      default: {
        // Slightly modified definition copied from 'react-native-reanimated'
        createAnimatedComponent<P extends object>(
          component: ComponentClass<P>,
          options?: unknown
        ): ComponentClass<P>;
      };
      useHandler: <THandlerData>(handlers: GestureCallbacks<THandlerData>) => {
        doDependenciesDiffer: boolean;
        context: ReanimatedContext<THandlerData>;
      };
      useEvent: <T>(
        callback: (event: T) => void,
        events: string[],
        rebuild: boolean
      ) => (event: unknown) => void;
      useSharedValue: <T>(value: T) => SharedValue<T>;
      setGestureState: (handlerTag: number, newState: number) => void;
      isSharedValue: (value: unknown) => value is SharedValue<unknown>;
      isWorkletFunction<
        Args extends unknown[] = unknown[],
        ReturnValue = unknown,
      >(
        value: unknown
      ): value is WorkletFunction<Args, ReturnValue>;
      useComposedEventHandler<T>(
        handlers: (((event: T) => void) | null)[]
      ): (event: T) => void;
      runOnUI<A extends any[], R>(
        fn: (...args: A) => R
      ): (...args: Parameters<typeof fn>) => void;
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
