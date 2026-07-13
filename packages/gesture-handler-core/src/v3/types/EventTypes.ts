import type { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';
import type { PointerType } from '../../PointerType';
import type { State } from '../../State';

// Structural replacement for React Native's NativeSyntheticEvent<T>. Only the
// `nativeEvent` member is ever accessed (see eventUtils.isNativeEvent), and a
// real NativeSyntheticEvent is assignable to this shape.
export type NativeSyntheticEventLike<T> = {
  nativeEvent: T;
};

// Structural replacement for React Native's Animated.Mapping: a recursive
// string-keyed mapping. Only `nativeEvent.handlerData` keys are ever read
// (see eventUtils.checkMappingForChangeProperties).
export type AnimatedMapping = {
  [key: string]: AnimatedMapping;
};

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

export type GestureHandlerEventWithHandlerData<
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
> =
  | UpdateEventWithHandlerData<TExtendedHandlerData>
  | StateChangeEventWithHandlerData<THandlerData>
  | TouchEvent;

export type UnpackedGestureHandlerEventWithHandlerData<
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
> =
  | GestureUpdateEventWithHandlerData<TExtendedHandlerData>
  | GestureStateChangeEventWithHandlerData<THandlerData>
  | GestureTouchEvent;

export type UpdateEventWithHandlerData<THandlerData> =
  | GestureUpdateEventWithHandlerData<THandlerData>
  | NativeSyntheticEventLike<GestureUpdateEventWithHandlerData<THandlerData>>;

export type StateChangeEventWithHandlerData<THandlerData> =
  | GestureStateChangeEventWithHandlerData<THandlerData>
  | NativeSyntheticEventLike<
      GestureStateChangeEventWithHandlerData<THandlerData>
    >;

export type TouchEvent =
  | GestureTouchEvent
  | NativeSyntheticEventLike<GestureTouchEvent>;

export type GestureEvent<THandlerData> = {
  handlerTag: number;
} & HandlerData<THandlerData>;

export type GestureEndEvent<THandlerData> = {
  canceled: boolean;
} & GestureEvent<THandlerData>;

export type UnpackedGestureHandlerEvent<THandlerData> =
  | GestureEvent<THandlerData>
  | GestureTouchEvent;

// This is not how Animated.event is typed in React Native. We add _argMapping in order to
// have access to the _argMapping property to check for usage of `change*` callbacks.
// It's also not typed as a function, which is breaking Gesture Handler type definitions.
export type AnimatedEvent = {
  _argMapping: (AnimatedMapping | null)[];
};

export type ChangeCalculatorType<TExtendedHandlerData> = (
  current: GestureUpdateEventWithHandlerData<TExtendedHandlerData>,
  previous?: GestureUpdateEventWithHandlerData<TExtendedHandlerData>
) => GestureUpdateEventWithHandlerData<TExtendedHandlerData>;

export type DiffCalculatorType<TExtendedHandlerData> = (
  current: HandlerData<TExtendedHandlerData>,
  previous: HandlerData<TExtendedHandlerData> | null
) => Partial<HandlerData<TExtendedHandlerData>>;
