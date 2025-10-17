import { Animated, NativeSyntheticEvent } from 'react-native';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';
import { PointerType } from '../../PointerType';
import { State } from '../../State';

type EventPayload = {
  handlerTag: number;
  state: State;
};
type StateChangeEventPayload = EventPayload & {
  oldState: State;
};

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

export type UnpackedGestureHandlerEvent<THandlerData> =
  | GestureUpdateEvent<THandlerData>
  | GestureStateChangeEvent<THandlerData>
  | GestureTouchEvent;

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

export type ChangeCalculatorType<THandlerData> = (
  current: GestureUpdateEvent<THandlerData>,
  previous?: GestureUpdateEvent<THandlerData>
) => GestureUpdateEvent<THandlerData>;

export type DiffCalculatorType<THandlerData> = (
  current: HandlerData<THandlerData>,
  previous: HandlerData<THandlerData> | null
) => Partial<HandlerData<THandlerData>>;
