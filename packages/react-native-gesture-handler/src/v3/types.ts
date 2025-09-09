import { Animated, NativeSyntheticEvent } from 'react-native';
import {
  GestureEventPayload,
  GestureTouchEvent,
  HandlerStateChangeEventPayload,
} from '../handlers/gestureHandlerCommon';
import { HandlerCallbacks } from '../handlers/gestures/gesture';

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

export type GestureEvents = {
  onGestureHandlerStateChange: (event: any) => void;
  onGestureHandlerEvent: undefined | ((event: any) => void);
  onGestureHandlerTouchEvent: (event: any) => void;
  onReanimatedStateChange: undefined | ((event: any) => void);
  onReanimatedUpdateEvent: undefined | ((event: any) => void);
  onReanimatedTouchEvent: undefined | ((event: any) => void);
  onGestureHandlerAnimatedEvent: undefined | AnimatedEvent;
};

export interface NativeGesture {
  tag: number;
  name: GestureType;
  config: Record<string, unknown>;
  gestureEvents: GestureEvents;
}

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
  _argMapping: (Animated.Mapping | null)[];
};

export interface LogicDetectorProps {
  viewTag: number;
  moduleId: number;
  handlerTags: number[];
}

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

export interface LogicMethods {
  onGestureHandlerEvent?: (e: any) => void;
  onGestureHandlerStateChange?: (e: any) => void;
  onGestureHandlerTouchEvent?: (e: any) => void;
  onReanimatedStateChange?: (e: any) => void;
  onReanimatedUpdateEvent?: (e: any) => void;
  onReanimatedTouchEvent?: (e: any) => void;
}
