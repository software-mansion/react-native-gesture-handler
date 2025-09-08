import { Animated, NativeSyntheticEvent } from 'react-native';
import {
  GestureEventPayload,
  GestureTouchEvent,
  HandlerStateChangeEventPayload,
} from '../handlers/gestureHandlerCommon';
import { ValueOf } from '../typeUtils';

export type GestureUpdateEvent<THandlerData> = GestureEventPayload & {
  handlerData: THandlerData;
};

export type GestureStateChangeEvent<THandlerData> =
  HandlerStateChangeEventPayload & {
    handlerData: THandlerData;
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

export const SingleGestureType = {
  Tap: 'TapGestureHandler',
  LongPress: 'LongPressGestureHandler',
  Pan: 'PanGestureHandler',
  Pinch: 'PinchGestureHandler',
  Rotation: 'RotationGestureHandler',
  Fling: 'FlingGestureHandler',
  Manual: 'ManualGestureHandler',
  Native: 'NativeGestureHandler',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type SingleGestureType = ValueOf<typeof SingleGestureType>;

export const ComposedGestureType = {
  Simultaneous: 'SimultaneousGesture',
  Exclusive: 'ExclusiveGesture',
  Race: 'RaceGesture',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ComposedGestureType = ValueOf<typeof ComposedGestureType>;

// TODO: Find better name
export const HandlerType = {
  ...SingleGestureType,
  ...ComposedGestureType,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type HandlerType = ValueOf<typeof HandlerType>;

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

export type NativeGesture<THandlerData, TConfig> = {
  tag: number;
  type: HandlerType;
  config: BaseGestureConfig<THandlerData, TConfig>;
  gestureEvents: GestureEvents<THandlerData>;
  gestureRelations: GestureRelations;
};

export type ComposedGesture = {
  tags: number[];
  type: ComposedGestureType;
  config: {
    shouldUseReanimated: boolean;
    dispatchesAnimatedEvents: boolean;
  };
  gestureEvents: GestureEvents<unknown>;
  gestures: (NativeGesture<unknown, unknown> | ComposedGesture)[];
};

export type ChangeCalculatorType<THandlerData> = (
  current: UpdateEvent<THandlerData>,
  previous?: UpdateEvent<THandlerData>
) => UpdateEvent<THandlerData>;

export type Gesture<THandlerData, TConfig> =
  | NativeGesture<THandlerData, TConfig>
  | ComposedGesture;

interface ExternalRelations {
  simultaneousWithExternalGesture?:
    | Gesture<unknown, unknown>
    | Gesture<unknown, unknown>[];
  requireExternalGestureToFail?:
    | Gesture<unknown, unknown>
    | Gesture<unknown, unknown>[];
  blocksExternalGesture?:
    | Gesture<unknown, unknown>
    | Gesture<unknown, unknown>[];
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

export type BaseGestureConfig<THandlerData, TConfig> = ExternalRelations &
  GestureCallbacks<THandlerData> &
  TConfig & {
    disableReanimated?: boolean;
    shouldUseReanimated?: boolean;
    dispatchesAnimatedEvents?: boolean;
    needsPointerData?: boolean;
    changeEventCalculator?: ChangeCalculatorType<THandlerData>;
  };
