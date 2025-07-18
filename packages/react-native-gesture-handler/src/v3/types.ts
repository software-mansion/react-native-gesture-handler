import { NativeSyntheticEvent } from 'react-native';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../handlers/gestureHandlerCommon';
import { HandlerCallbacks } from '../handlers/gestures/gesture';

type GestureUpdateEventWithData<T> = GestureUpdateEvent & {
  handlerData: T;
};

type GestureStateChangeEventWithData<T> = GestureStateChangeEvent & {
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

export type CallbackHandlers = Omit<
  HandlerCallbacks<Record<string, unknown>>,
  'gestureId' | 'handlerTag' | 'isWorklet'
>;
