import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../handlers/gestureHandlerCommon';

export type GestureHandlerEvent = UpdateEvent | StateChangeEvent | TouchEvent;

export type UpdateEvent =
  | GestureUpdateEvent
  | EventWithNativeEvent<GestureUpdateEvent>;

export type StateChangeEvent =
  | GestureStateChangeEvent
  | EventWithNativeEvent<GestureStateChangeEvent>;

export type TouchEvent =
  | GestureTouchEvent
  | EventWithNativeEvent<GestureTouchEvent>;

export type EventWithNativeEvent<T> = {
  nativeEvent: T;
};
