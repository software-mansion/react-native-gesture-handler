import { NativeSyntheticEvent } from 'react-native';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../handlers/gestureHandlerCommon';

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
