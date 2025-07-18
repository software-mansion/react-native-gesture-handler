import { NativeSyntheticEvent } from 'react-native';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../handlers/gestureHandlerCommon';
import { HandlerCallbacks } from '../handlers/gestures/gesture';

export type GestureHandlerEvent = UpdateEvent | StateChangeEvent | TouchEvent;

export type UpdateEvent =
  | GestureUpdateEvent
  | NativeSyntheticEvent<GestureUpdateEvent>;

export type StateChangeEvent =
  | GestureStateChangeEvent
  | NativeSyntheticEvent<GestureStateChangeEvent>;

export type TouchEvent =
  | GestureTouchEvent
  | NativeSyntheticEvent<GestureTouchEvent>;

export type CallbackHandlers = Omit<
  HandlerCallbacks<Record<string, unknown>>,
  'gestureId' | 'handlerTag' | 'isWorklet'
>;
