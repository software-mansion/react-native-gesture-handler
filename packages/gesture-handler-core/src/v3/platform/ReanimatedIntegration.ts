import type { ComponentClass } from 'react';

import type {
  GestureCallbacks,
  ReanimatedHandler,
  SharedValue,
} from '../types';

interface WorkletProps {
  __closure: unknown;
  __workletHash: number;
  __initData?: unknown;
  __init?: () => unknown;
  __stackDetails?: unknown;
  __pluginVersion?: string;
}

export type WorkletFunction<
  TArgs extends unknown[] = unknown[],
  TReturn = unknown,
> = ((...args: TArgs) => TReturn) & WorkletProps;

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

// The structural surface of react-native-reanimated that the platform binding
// provides through the port. Core never imports reanimated itself.
// Slightly modified definitions copied from 'react-native-reanimated'.
export interface ReanimatedIntegration {
  default: {
    createAnimatedComponent<P extends object>(
      component: ComponentClass<P>,
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
  isWorkletFunction<Args extends unknown[] = unknown[], ReturnValue = unknown>(
    value: unknown
  ): value is WorkletFunction<Args, ReturnValue>;
  useComposedEventHandler<T>(
    handlers: (((event: T) => void) | null)[]
  ): (event: T) => void;
  runOnJS<A extends unknown[], R>(
    fn: (...args: A) => R
  ): (...args: Parameters<typeof fn>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runOnUI<A extends any[], R>(
    fn: (...args: A) => R
  ): (...args: Parameters<typeof fn>) => void;
  makeMutable<T>(value: T): { value: T };
}
