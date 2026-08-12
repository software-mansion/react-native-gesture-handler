import type { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';
import type { PointerType } from '../../PointerType';
import type { State } from '../../State';

// Structural stand-in for a synthetic event carrying `nativeEvent`. Kept
// minimal on purpose: RN 0.87's Strict TS API makes the other synthetic-event
// fields optional, so any richer shape stops being a superset of the real
// `NativeSyntheticEvent` across RN versions. We only ever read `nativeEvent`.
export type NativeEventWrapper<T> = {
  nativeEvent: T;
};

// Payload of the managed button's press events. The codegen spec
// (`specs/RNGestureHandlerButtonNativeComponent`) declares its own
// codegen type — specs must stay self-contained for the codegen parser
export type ButtonEvent = Readonly<{
  pointerInside: boolean;
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  numberOfPointers: number;
  pointerType: PointerType;
}>;

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
  | NativeEventWrapper<GestureUpdateEventWithHandlerData<THandlerData>>;

export type StateChangeEventWithHandlerData<THandlerData> =
  | GestureStateChangeEventWithHandlerData<THandlerData>
  | NativeEventWrapper<GestureStateChangeEventWithHandlerData<THandlerData>>;

export type TouchEvent =
  | GestureTouchEvent
  | NativeEventWrapper<GestureTouchEvent>;

export type GestureEvent<THandlerData> = {
  handlerTag: number;
} & HandlerData<THandlerData>;

export type GestureEndEvent<THandlerData> = {
  canceled: boolean;
} & GestureEvent<THandlerData>;

export type UnpackedGestureHandlerEvent<THandlerData> =
  | GestureEvent<THandlerData>
  | GestureTouchEvent;

// Structural stand-in for RN's `Animated.Value` as a mapping leaf: the
// mapping checks only walk the object structure and never call into the
// value, so any non-mapping shape with Animated.Value's core method works.
type AnimatedValue = {
  setValue: (value: number) => void;
};

// This is not how Animated.event is typed in React Native. We add _argMapping in order to
// have access to the _argMapping property to check for usage of `change*` callbacks.
// It's also not typed as a function, which is breaking Gesture Handler type definitions.
type AnimatedMapping = { [key: string]: AnimatedMapping } | AnimatedValue;

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
