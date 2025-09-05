import { Animated, NativeSyntheticEvent } from 'react-native';
import {
  GestureEventPayload,
  GestureTouchEvent,
  HandlerStateChangeEventPayload,
} from '../handlers/gestureHandlerCommon';
import { HandlerCallbacks } from '../handlers/gestures/gesture';
import { ValueOf } from '../typeUtils';

export type GestureUpdateEvent<T> = GestureEventPayload & {
  handlerData: T;
};

export type GestureStateChangeEvent<T> = HandlerStateChangeEventPayload & {
  handlerData: T;
};

export type GestureHandlerEvent<T> =
  | UpdateEvent<T>
  | StateChangeEvent<T>
  | TouchEvent;

export type UpdateEvent<T> =
  | GestureUpdateEvent<T>
  | NativeSyntheticEvent<GestureUpdateEvent<T>>;

export type StateChangeEvent<T> =
  | GestureStateChangeEvent<T>
  | NativeSyntheticEvent<GestureStateChangeEvent<T>>;

export type TouchEvent =
  | GestureTouchEvent
  | NativeSyntheticEvent<GestureTouchEvent>;

// TODO: Replace with v3 specific types
export type CallbackHandlers = Omit<
  HandlerCallbacks<Record<string, unknown>>,
  | 'gestureId'
  | 'handlerTag'
  | 'isWorklet'
  | 'changeEventCalculator'
  | 'onChange'
>;

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

export type GestureEvents = {
  onGestureHandlerStateChange: (
    event: StateChangeEvent<Record<string, unknown>>
  ) => void;
  onGestureHandlerEvent:
    | undefined
    | ((event: UpdateEvent<Record<string, unknown>>) => void);
  onGestureHandlerTouchEvent: (event: TouchEvent) => void;
  onReanimatedStateChange:
    | undefined
    | ((event: StateChangeEvent<Record<string, unknown>>) => void);
  onReanimatedUpdateEvent:
    | undefined
    | ((event: UpdateEvent<Record<string, unknown>>) => void);
  onReanimatedTouchEvent: undefined | ((event: TouchEvent) => void);
  onGestureHandlerAnimatedEvent: undefined | AnimatedEvent;
};

export type GestureRelations = {
  simultaneousHandlers: number[];
  waitFor: number[];
  blocksHandlers: number[];
};

export type NativeGesture = {
  tag: number;
  type: HandlerType;
  config: BaseGestureConfig<unknown>;
  gestureEvents: GestureEvents;
  gestureRelations: GestureRelations;
};

export type ComposedGesture = {
  tags: number[];
  type: ComposedGestureType;
  config: {
    shouldUseReanimated: boolean;
    dispatchesAnimatedEvents: boolean;
  };
  gestureEvents: GestureEvents;
  gestures: (NativeGesture | ComposedGesture)[];
};

export type ChangeCalculatorType = (
  current: UpdateEvent<Record<string, unknown>>,
  previous?: UpdateEvent<Record<string, unknown>>
) => UpdateEvent<Record<string, unknown>>;

export type Gesture = NativeGesture | ComposedGesture;

interface ExternalRelations {
  simultaneousWithExternalGesture?: Gesture | Gesture[];
  requireExternalGestureToFail?: Gesture | Gesture[];
  blocksExternalGesture?: Gesture | Gesture[];
}

export interface GestureCallbacks<T> {
  onBegin?: (event: GestureStateChangeEvent<T>) => void;
  onStart?: (event: GestureStateChangeEvent<T>) => void;
  onEnd?: (event: GestureStateChangeEvent<T>, success: boolean) => void;
  onFinalize?: (event: GestureStateChangeEvent<T>, success: boolean) => void;
  onUpdate?: (event: GestureUpdateEvent<T>) => void | AnimatedEvent;
  onTouchesDown?: (event: GestureTouchEvent) => void;
  onTouchesMove?: (event: GestureTouchEvent) => void;
  onTouchesUp?: (event: GestureTouchEvent) => void;
  onTouchesCancelled?: (event: GestureTouchEvent) => void;
}

export interface BaseGestureConfig<T>
  extends ExternalRelations,
    GestureCallbacks<T>,
    Record<string, unknown> {
  disableReanimated?: boolean;
  shouldUseReanimated?: boolean;
  dispatchesAnimatedEvents?: boolean;
  needsPointerData?: boolean;
  changeEventCalculator?: ChangeCalculatorType;
}
