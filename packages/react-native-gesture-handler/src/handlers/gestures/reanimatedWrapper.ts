import type { ComponentClass, ComponentType } from 'react';

import { tagMessage } from '../../utils';
import type {
  GestureCallbacks,
  GestureUpdateEventWithHandlerData,
  SharedValue,
} from '../../v3/types';
import { installUIRuntimeBindings } from './installUIRuntimeBindings';

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

export type SimplifiedShareableHost<TValue = unknown> = {
  value: TValue;
};

type WorkletsPackage = {
  getUIRuntimeHolder: () => object;
  createShareable: <TValue>(
    hostRuntimeId: number,
    initial: TValue
  ) => SimplifiedShareableHost<TValue>;
  UIRuntimeId: number;
  scheduleOnUI: <Args extends unknown[], ReturnValue>(
    worklet: (...args: Args) => ReturnValue,
    ...args: Args
  ) => void;
  scheduleOnRN: <Args extends unknown[], ReturnValue>(
    fun: (...args: Args) => ReturnValue,
    ...args: Args
  ) => void;
  isWorkletFunction: <
    Args extends unknown[] = unknown[],
    ReturnValue = unknown,
  >(
    value: unknown
  ) => value is WorkletFunction<Args, ReturnValue>;
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

type ReanimatedPackage = {
  default: {
    // Slightly modified definition copied from 'react-native-reanimated'
    createAnimatedComponent<P extends object>(
      component: ComponentType<P>,
      options?: unknown
    ): ComponentClass<P>;
  };
  NativeEventsManager: NativeEventsManager;
  useHandler: <THandlerData, TExtendedHandlerData extends THandlerData>(
    handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>
  ) => ReanimatedHandler<TExtendedHandlerData>;
  useEvent: <T>(
    callback: (event: T) => void,
    events: string[],
    rebuild: boolean
  ) => (event: unknown) => void;
  useSharedValue: <T>(value: T) => SharedValue<T>;
  setGestureState: (handlerTag: number, newState: number) => void;
  isSharedValue: <T = unknown>(value: unknown) => value is SharedValue<T>;
  useComposedEventHandler<T>(
    handlers: (((event: T) => void) | null)[]
  ): (event: T) => void;
};

let Reanimated: ReanimatedPackage | undefined;
let Worklets: WorkletsPackage | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Worklets = require('react-native-worklets') as WorkletsPackage;
} catch (e) {
  // When 'react-native-worklets' is not available we want to quietly continue
  Worklets = undefined;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Reanimated = require('react-native-reanimated') as ReanimatedPackage;
} catch (e) {
  // When 'react-native-reanimated' is not available we want to quietly continue
  // @ts-ignore TS demands the variable to be initialized
  Reanimated = undefined;
}

if (Worklets !== undefined) {
  installUIRuntimeBindings(Worklets.getUIRuntimeHolder);
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

export { Reanimated, Worklets };
