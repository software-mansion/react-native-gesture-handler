import { Animated, NativeSyntheticEvent } from 'react-native';
import { GestureTouchEvent } from '../handlers/gestureHandlerCommon';
import { HandlerCallbacks } from '../handlers/gestures/gesture';
import { ValueOf } from '../typeUtils';
import { State } from '../State';

export interface EventPayload {
  handlerTag: number;
  state: ValueOf<typeof State>;
}
export interface NativeStateChangeEventPayload extends EventPayload {
  oldState: ValueOf<typeof State>;
}

export type GestureUpdateEventWithData<T> = EventPayload & {
  handlerData: T;
};

export type GestureStateChangeEventWithData<T> =
  NativeStateChangeEventPayload & {
    handlerData: T;
  };

export type GestureHandlerEvent<T> =
  | UpdateEvent<T>
  | StateChangeEvent<T>
  | TouchEvent;

export type UpdateEvent<T> =
  | GestureUpdateEventWithData<T>
  | NativeSyntheticEvent<GestureUpdateEventWithData<T>>;

export type StateChangeEvent<T> =
  | GestureStateChangeEventWithData<T>
  | NativeSyntheticEvent<GestureStateChangeEventWithData<T>>;

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

export enum SingleGestureName {
  Tap = 'TapGestureHandler',
  LongPress = 'LongPressGestureHandler',
  Pan = 'PanGestureHandler',
  Pinch = 'PinchGestureHandler',
  Rotation = 'RotationGestureHandler',
  Fling = 'FlingGestureHandler',
  Manual = 'ManualGestureHandler',
  Native = 'NativeGestureHandler',
}

export enum ComposedGestureName {
  Simultaneous = 'SimultaneousGesture',
  Exclusive = 'ExclusiveGesture',
  Race = 'RaceGesture',
}

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

export type SingleGesture = {
  tag: number;
  type: SingleGestureName;
  config: Record<string, unknown>;
  gestureEvents: GestureEvents;
  gestureRelations: GestureRelations;
};

export type ComposedGesture = {
  tags: number[];
  type: ComposedGestureName;
  config: {
    shouldUseReanimated: boolean;
    dispatchesAnimatedEvents: boolean;
  };
  gestureEvents: GestureEvents;
  externalSimultaneousHandlers: number[];
  gestures: Gesture[];
};

export type Gesture = SingleGesture | ComposedGesture;
