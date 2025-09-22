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

export interface LogicChildren {
  viewTag: number;
  handlerTags: number[];
}

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
  current: UpdateEvent<THandlerData>,
  previous?: UpdateEvent<THandlerData>
) => UpdateEvent<THandlerData>;

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

export type BaseGestureConfig<THandlerData, TConfig> = ExternalRelations &
  GestureCallbacks<THandlerData> &
  FilterNeverProperties<TConfig> &
  InternalConfigProps<THandlerData> & {
    disableReanimated?: boolean;
    enabled?: boolean;
    shouldCancelWhenOutside?: boolean;
    hitSlop?: HitSlop;
    userSelect?: UserSelect;
    activeCursor?: ActiveCursor;
    mouseButton?: MouseButton;
    enableContextMenu?: boolean;
    touchAction?: TouchAction;
  };

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
