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

type BaseHandlerData = {
  numberOfPointers: number;
  pointerType: PointerType;
};

export type HandlerData<T> = BaseHandlerData & T;

export type GestureUpdateEventWithHandlerData<T> = EventPayload & {
  handlerData: HandlerData<T>;
};

export type GestureStateChangeEventWithHandlerData<T> =
  StateChangeEventPayload & {
    handlerData: HandlerData<T>;
  };

export type GestureHandlerEventWithHandlerData<THandlerData> =
  | UpdateEventWithHandlerData<THandlerData>
  | StateChangeEventWithHandlerData<THandlerData>
  | TouchEvent;

export type UnpackedGestureHandlerEventWithHandlerData<THandlerData> =
  | GestureUpdateEventWithHandlerData<THandlerData>
  | GestureStateChangeEventWithHandlerData<THandlerData>
  | GestureTouchEvent;

export type UpdateEventWithHandlerData<THandlerData> =
  | GestureUpdateEventWithHandlerData<THandlerData>
  | NativeSyntheticEvent<GestureUpdateEventWithHandlerData<THandlerData>>;

export type StateChangeEventWithHandlerData<THandlerData> =
  | GestureStateChangeEventWithHandlerData<THandlerData>
  | NativeSyntheticEvent<GestureStateChangeEventWithHandlerData<THandlerData>>;

export type TouchEvent =
  | GestureTouchEvent
  | NativeSyntheticEvent<GestureTouchEvent>;

export type GestureEvent<THandlerData> = {
  handlerTag: number;
} & HandlerData<THandlerData>;

export type UnpackedGestureHandlerEvent<THandlerData> =
  | GestureEvent<THandlerData>
  | GestureTouchEvent;

// This is not how Animated.event is typed in React Native. We add _argMapping in order to
// have access to the _argMapping property to check for usage of `change*` callbacks.
// It's also not typed as a function, which is breaking Gesture Handler type definitions.
export type AnimatedEvent = {
  _argMapping: (Animated.Mapping | null)[];
};

export type ChangeCalculatorType<THandlerData> = (
  current: GestureUpdateEventWithHandlerData<THandlerData>,
  previous?: GestureUpdateEventWithHandlerData<THandlerData>
) => GestureUpdateEventWithHandlerData<THandlerData>;

export type DiffCalculatorType<THandlerData> = (
  current: HandlerData<THandlerData>,
  previous: HandlerData<THandlerData> | null
) => Partial<HandlerData<THandlerData>>;
