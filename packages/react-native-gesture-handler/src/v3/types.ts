import { NativeSyntheticEvent } from 'react-native';
import {
  GestureEventPayload,
  GestureTouchEvent,
  HandlerStateChangeEventPayload,
} from '../handlers/gestureHandlerCommon';
import { HandlerCallbacks } from '../handlers/gestures/gesture';

export type GestureUpdateEventWithData<T> = GestureEventPayload & {
  handlerData: T;
};

export type GestureStateChangeEventWithData<T> =
  HandlerStateChangeEventPayload & {
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
  _argMapping?: unknown;
};

export type GestureType =
  | 'TapGestureHandler'
  | 'LongPressGestureHandler'
  | 'PanGestureHandler'
  | 'PinchGestureHandler'
  | 'RotationGestureHandler'
  | 'FlingGestureHandler'
  | 'ForceTouchGestureHandler'
  | 'ManualGestureHandler'
  | 'NativeViewGestureHandler';

export type ComposedGestureType =
  | 'SimultaneousGesture'
  | 'ExclusiveGesture'
  | 'RaceGesture'
  | 'ComposedGesture';

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
  simultaneousGestures: number[];
  exclusiveGestures: number[];
};

export type NativeGesture = {
  tag: number;
  name: GestureType;
  config: Record<string, unknown>;
  gestureEvents: GestureEvents;
  simultaneousHandlers: number[];
  waitFor: number[];
  blocksHandlers: number[];
};

export type ComposedGesture = {
  tags: number[];
  name: ComposedGestureType;
  config: {
    shouldUseReanimated: boolean;
    dispatchesAnimatedEvents: boolean;
  };
  gestureEvents: GestureEvents;
  gestures: (NativeGesture | ComposedGesture)[];
};
