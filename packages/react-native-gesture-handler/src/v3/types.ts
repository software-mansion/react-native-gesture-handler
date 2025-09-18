import { Animated, NativeSyntheticEvent } from 'react-native';
import {
  ActiveCursor,
  GestureTouchEvent,
  HitSlop,
  MouseButton,
  TouchAction,
  UserSelect,
} from '../handlers/gestureHandlerCommon';
import { PointerType } from '../PointerType';

import { State } from '../State';

interface EventPayload {
  handlerTag: number;
  state: State;
}
interface StateChangeEventPayload extends EventPayload {
  oldState: State;
}

export type BaseHandlerData = {
  numberOfPointers: number;
  pointerType: PointerType;
};

export type HandlerData<T> = BaseHandlerData & T;

export type GestureUpdateEvent<T> = EventPayload & {
  handlerData: HandlerData<T>;
};

export type GestureStateChangeEvent<T> = StateChangeEventPayload & {
  handlerData: HandlerData<T>;
};

export type GestureHandlerEvent<THandlerData> =
  | UpdateEvent<THandlerData>
  | StateChangeEvent<THandlerData>
  | TouchEvent;

export type ExtractedGestureHandlerEvent<THandlerData> =
  | GestureUpdateEvent<THandlerData>
  | GestureStateChangeEvent<THandlerData>
  | GestureTouchEvent;

export type UpdateEvent<THandlerData> =
  | GestureUpdateEvent<THandlerData>
  | NativeSyntheticEvent<GestureUpdateEvent<THandlerData>>;

export type StateChangeEvent<THandlerData> =
  | GestureStateChangeEvent<THandlerData>
  | NativeSyntheticEvent<GestureStateChangeEvent<THandlerData>>;

export type TouchEvent =
  | GestureTouchEvent
  | NativeSyntheticEvent<GestureTouchEvent>;

// This is almost how Animated.event is typed in React Native. We add _argMapping in order to:
// 1. Distinguish it from a regular function,
// 2. Have access to the _argMapping property to check for usage of `change*` callbacks.
export type AnimatedEvent = ((...args: any[]) => void) & {
  _argMapping: (Animated.Mapping | null)[];
};

export enum SingleGestureName {
  Tap = 'TapGestureHandler',
  LongPress = 'LongPressGestureHandler',
  Pan = 'PanGestureHandler',
  Pinch = 'PinchGestureHandler',
  Rotation = 'RotationGestureHandler',
  Fling = 'FlingGestureHandler',
  Manual = 'ManualGestureHandler',
  Native = 'NativeViewGestureHandler',
  Hover = 'HoverGestureHandler',
}

export enum ComposedGestureName {
  Simultaneous = 'SimultaneousGesture',
  Exclusive = 'ExclusiveGesture',
  Race = 'RaceGesture',
}

export type GestureEvents<THandlerData> = {
  onGestureHandlerStateChange: (event: StateChangeEvent<THandlerData>) => void;
  onGestureHandlerEvent:
    | undefined
    | ((event: UpdateEvent<THandlerData>) => void);
  onGestureHandlerTouchEvent: (event: TouchEvent) => void;
  onReanimatedStateChange:
    | undefined
    | ((event: StateChangeEvent<THandlerData>) => void);
  onReanimatedUpdateEvent:
    | undefined
    | ((event: UpdateEvent<THandlerData>) => void);
  onReanimatedTouchEvent: undefined | ((event: TouchEvent) => void);
  onGestureHandlerAnimatedEvent: undefined | AnimatedEvent;
};

export type GestureRelations = {
  simultaneousHandlers: number[];
  waitFor: number[];
  blocksHandlers: number[];
};

export type SingleGesture<THandlerData, TConfig> = {
  tag: number;
  type: SingleGestureName;
  config: BaseGestureConfig<THandlerData, TConfig>;
  gestureEvents: GestureEvents<THandlerData>;
  gestureRelations: GestureRelations;
};

export type ComposedGesture = {
  tags: number[];
  type: ComposedGestureName;
  config: {
    shouldUseReanimated: boolean;
    dispatchesAnimatedEvents: boolean;
  };
  gestureEvents: GestureEvents<unknown>;
  externalSimultaneousHandlers: number[];
  gestures: Gesture[];
};

export type ChangeCalculatorType<THandlerData> = (
  current: GestureUpdateEvent<THandlerData>,
  previous?: GestureUpdateEvent<THandlerData>
) => GestureUpdateEvent<THandlerData>;

export type DiffCalculatorType<THandlerData> = (
  current: HandlerData<THandlerData>,
  previous: HandlerData<THandlerData> | null
) => Partial<HandlerData<THandlerData>>;

export type Gesture<THandlerData = unknown, TConfig = unknown> =
  | SingleGesture<THandlerData, TConfig>
  | ComposedGesture;

interface ExternalRelations {
  simultaneousWithExternalGesture?: Gesture | Gesture[];
  requireExternalGestureToFail?: Gesture | Gesture[];
  blocksExternalGesture?: Gesture | Gesture[];
}

export interface GestureCallbacks<THandlerData> {
  onBegin?: (event: GestureStateChangeEvent<THandlerData>) => void;
  onStart?: (event: GestureStateChangeEvent<THandlerData>) => void;
  onEnd?: (
    event: GestureStateChangeEvent<THandlerData>,
    success: boolean
  ) => void;
  onFinalize?: (
    event: GestureStateChangeEvent<THandlerData>,
    success: boolean
  ) => void;
  onUpdate?: (event: GestureUpdateEvent<THandlerData>) => void | AnimatedEvent;
  onTouchesDown?: (event: GestureTouchEvent) => void;
  onTouchesMove?: (event: GestureTouchEvent) => void;
  onTouchesUp?: (event: GestureTouchEvent) => void;
  onTouchesCancelled?: (event: GestureTouchEvent) => void;
}

export type InternalConfigProps<THandlerData> = {
  shouldUseReanimated?: boolean;
  dispatchesAnimatedEvents?: boolean;
  needsPointerData?: boolean;
  changeEventCalculator?: ChangeCalculatorType<THandlerData>;
};

type CommonGestureConfig = WithSharedValue<
  {
    disableReanimated?: boolean;
    enabled?: boolean;
    shouldCancelWhenOutside?: boolean;
    hitSlop?: HitSlop;
    userSelect?: UserSelect;
    activeCursor?: ActiveCursor;
    mouseButton?: MouseButton;
    enableContextMenu?: boolean;
    touchAction?: TouchAction;
  },
  HitSlop | UserSelect | ActiveCursor | MouseButton | TouchAction
>;

export type BaseGestureConfig<THandlerData, TConfig> = ExternalRelations &
  GestureCallbacks<THandlerData> &
  FilterNeverProperties<TConfig> &
  InternalConfigProps<THandlerData> &
  CommonGestureConfig;

export type ExcludeInternalConfigProps<T> = Omit<
  T,
  keyof InternalConfigProps<unknown>
>;

// Some handlers do not have specific properties (e.g. `Pinch`), therefore we mark those prop types as `Record<string, never>`.
// Doing intersection with those types results in type which cannot have any property. In order to fix that,
// we filter out properties with `never` values.
//
// This piece of magic works like this:
// 1. We iterate over all keys of T using `keyof T`
// 2. We check if the type of property is `never` using conditional types (`T[K] extends never ? never : K`).
//    If it is, we replace the key with `never`, i.e. we delete it. Otherwise we keep it as is.
type FilterNeverProperties<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

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

// Apply SharedValue recursively. P is used to make sure that composed types won't be expanded.
// For example, if we pass `HoverEffect` as P, then resulting type will have HoverEffect | SharedValue<HoverEffect>,
// not HoverEffect, SharedValue<HoverEffect.NONE>, ...
type WithSharedValueRecursive<T extends object, P> = {
  [K in keyof T]: Exclude<T[K], undefined> extends P
    ? Simplify<TOrSharedValue<T[K]>>
    : // Special case for boolean as passing `boolean` as P doesn't look ok.
      boolean extends T[K]
      ? boolean | SharedValue<boolean>
      : // Special handling for tuples [number, number].
        T[K] extends [number, number]
        ? [WithSharedValue<number, P>, WithSharedValue<number, P>]
        : // Default case: apply the MaybeWithSharedValue logic recursively or as a direct SharedValue wrap.
          WithSharedValue<T[K], P>;
};

export type TOrSharedValue<T> = T | SharedValue<Exclude<T, undefined>>;

// Utility type that decides whether to recurse for objects or apply SharedValue directly.
export type WithSharedValue<T, P = never> = T extends object
  ? WithSharedValueRecursive<T, P>
  : Simplify<TOrSharedValue<T>>;

// Simplifies types for end users.
// For example, changes TOrSharedValue<number> into number | SharedValue<number>.
type Simplify<T> =
  T extends SharedValue<never>
    ? never
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T extends SharedValue<any>
      ? T
      : {
          // For a generic object, retain the original structure while forcing an object type
          [K in keyof T]: T[K];
          // eslint-disable-next-line @typescript-eslint/ban-types
        } & {};
