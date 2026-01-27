import { ComponentClass } from 'react';
import { tagMessage } from '../../utils';
import {
  GestureCallbacks,
  GestureUpdateEventWithHandlerData,
  SharedValue,
} from '../../v3/types';
import { NativeProxy } from '../../v3/NativeProxy';

export type ReanimatedContext<THandlerData> = {
  lastUpdateEvent: GestureUpdateEventWithHandlerData<THandlerData> | undefined;
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

export type ReanimatedHandler<THandlerData> = {
  doDependenciesDiffer: boolean;
  context: ReanimatedContext<THandlerData>;
};

export type NativeEventsManager = new (component: {
  props: Record<string, unknown>;
  _componentRef: React.Ref<unknown>;
  // Removed in https://github.com/software-mansion/react-native-reanimated/pull/6736
  // but we likely want to keep it for compatibility with older Reanimated versions
  _componentViewTag: number;
  getComponentViewTag: () => number;
}) => {
  attachEvents: () => void;
  detachEvents: () => void;
  updateEvents: (prevProps: Record<string, unknown>) => void;
};

let Reanimated:
  | {
      default: {
        // Slightly modified definition copied from 'react-native-reanimated'
        createAnimatedComponent<P extends object>(
          component: ComponentClass<P>,
          options?: unknown
        ): ComponentClass<P>;
      };
      NativeEventsManager: NativeEventsManager;
      useHandler: <THandlerData>(
        handlers: GestureCallbacks<THandlerData>
      ) => ReanimatedHandler<THandlerData>;
      useEvent: <T>(
        callback: (event: T) => void,
        events: string[],
        rebuild: boolean
      ) => (event: unknown) => void;
      useSharedValue: <T>(value: T) => SharedValue<T>;
      setGestureState: (handlerTag: number, newState: number) => void;
      isSharedValue: <T = unknown>(value: unknown) => value is SharedValue<T>;
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
  NativeProxy.setReanimatedAvailability();
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
