import invariant from 'invariant';
import { DeviceEventEmitter } from 'react-native';
import { ReactTestInstance } from 'react-test-renderer';
import {
  FlingGestureHandler,
  flingHandlerName,
} from '../handlers/FlingGestureHandler';
import {
  ForceTouchGestureHandler,
  forceTouchHandlerName,
} from '../handlers/ForceTouchGestureHandler';
import {
  BaseGestureHandlerProps,
  GestureEvent,
  HandlerStateChangeEvent,
} from '../handlers/gestureHandlerCommon';
import { FlingGesture } from '../handlers/gestures/flingGesture';
import { ForceTouchGesture } from '../handlers/gestures/forceTouchGesture';
import { BaseGesture, GestureType } from '../handlers/gestures/gesture';
import { LongPressGesture } from '../handlers/gestures/longPressGesture';
import { NativeGesture } from '../handlers/gestures/nativeGesture';
import { PanGesture } from '../handlers/gestures/panGesture';
import { PinchGesture } from '../handlers/gestures/pinchGesture';
import { RotationGesture } from '../handlers/gestures/rotationGesture';
import { TapGesture } from '../handlers/gestures/tapGesture';
import { findHandlerByTestID } from '../handlers/handlersRegistry';
import {
  LongPressGestureHandler,
  longPressHandlerName,
} from '../handlers/LongPressGestureHandler';
import type {
  FlingGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
  NativeViewGestureHandlerPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from '../handlers/GestureHandlerEventPayload';
import {
  NativeViewGestureHandler,
  nativeViewHandlerName,
} from '../handlers/NativeViewGestureHandler';
import {
  PanGestureHandler,
  panHandlerName,
} from '../handlers/PanGestureHandler';
import {
  PinchGestureHandler,
  pinchHandlerName,
} from '../handlers/PinchGestureHandler';
import {
  RotationGestureHandler,
  rotationHandlerName,
} from '../handlers/RotationGestureHandler';
import {
  TapGestureHandler,
  tapHandlerName,
} from '../handlers/TapGestureHandler';
import { State } from '../State';
import { hasProperty, withPrevAndCurrent } from '../utils';

// Load fireEvent conditionally, so RNGH may be used in setups without testing-library
let fireEvent = (
  _element: ReactTestInstance,
  _name: string,
  ..._data: any[]
) => {
  // NOOP
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fireEvent = require('@testing-library/react-native').fireEvent;
} catch (_e) {
  // Do nothing if not available
}

type GestureHandlerTestEvent<
  TEventPayload extends Record<string, unknown> = Record<string, unknown>
> = (
  | GestureEvent<TEventPayload>
  | HandlerStateChangeEvent<TEventPayload>
)['nativeEvent'];

type HandlerNames = keyof DefaultEventsMapping;

type WithNumberOfPointers<T> = {
  [P in keyof T]: T[P] & { numberOfPointers: number };
};
type DefaultEventsMapping = WithNumberOfPointers<{
  [flingHandlerName]: FlingGestureHandlerEventPayload;
  [forceTouchHandlerName]: ForceTouchGestureHandlerEventPayload;
  [longPressHandlerName]: LongPressGestureHandlerEventPayload;
  [nativeViewHandlerName]: NativeViewGestureHandlerPayload;
  [panHandlerName]: PanGestureHandlerEventPayload;
  [pinchHandlerName]: PinchGestureHandlerEventPayload;
  [rotationHandlerName]: RotationGestureHandlerEventPayload;
  [tapHandlerName]: TapGestureHandlerEventPayload;
}>;

const handlersDefaultEvents: DefaultEventsMapping = {
  [flingHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    numberOfPointers: 1,
  },
  [forceTouchHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    force: 1,
    numberOfPointers: 1,
  },
  [longPressHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    duration: 100,
    numberOfPointers: 1,
  },
  [nativeViewHandlerName]: {
    pointerInside: true,
    numberOfPointers: 1,
  },
  [panHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    translationX: 100,
    translationY: 0,
    velocityX: 3,
    velocityY: 0,
    numberOfPointers: 1,
    stylusData: undefined,
  },
  [pinchHandlerName]: {
    focalX: 0,
    focalY: 0,
    scale: 2,
    velocity: 1,
    numberOfPointers: 2,
  },
  [rotationHandlerName]: {
    anchorX: 0,
    anchorY: 0,
    rotation: 3.14,
    velocity: 2,
    numberOfPointers: 2,
  },
  [tapHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    numberOfPointers: 1,
  },
};

function isGesture(
  componentOrGesture: ReactTestInstance | GestureType
): componentOrGesture is GestureType {
  return componentOrGesture instanceof BaseGesture;
}

interface WrappedGestureHandlerTestEvent {
  nativeEvent: GestureHandlerTestEvent;
}
function wrapWithNativeEvent(
  event: GestureHandlerTestEvent
): WrappedGestureHandlerTestEvent {
  return { nativeEvent: event };
}

function fillOldStateChanges(
  previousEvent: GestureHandlerTestEvent | null,
  currentEvent: Omit<GestureHandlerTestEvent, 'oldState'>
): GestureHandlerTestEvent {
  const isFirstEvent = previousEvent === null;
  if (isFirstEvent) {
    return {
      oldState: State.UNDETERMINED,
      ...currentEvent,
    } as GestureHandlerTestEvent;
  }

  const isGestureStateEvent = previousEvent.state !== currentEvent.state;
  if (isGestureStateEvent) {
    return {
      oldState: previousEvent?.state,
      ...currentEvent,
    } as GestureHandlerTestEvent;
  } else {
    return currentEvent as GestureHandlerTestEvent;
  }
}

type EventWithStates = Partial<
  Pick<GestureHandlerTestEvent, 'oldState' | 'state'>
>;
function validateStateTransitions(
  previousEvent: EventWithStates | null,
  currentEvent: EventWithStates
) {
  function stringify(event: Record<string, unknown> | null) {
    return JSON.stringify(event, null, 2);
  }
  function errorMsgWithBothEvents(description: string) {
    return `${description}, invalid event: ${stringify(
      currentEvent
    )}, previous event: ${stringify(previousEvent)}`;
  }

  function errorMsgWithCurrentEvent(description: string) {
    return `${description}, invalid event: ${stringify(currentEvent)}`;
  }

  invariant(
    hasProperty(currentEvent, 'state'),
    errorMsgWithCurrentEvent('every event must have state')
  );

  const isFirstEvent = previousEvent === null;
  if (isFirstEvent) {
    invariant(
      currentEvent.state === State.BEGAN,
      errorMsgWithCurrentEvent('first event must have BEGAN state')
    );
  }

  if (previousEvent !== null) {
    if (previousEvent.state !== currentEvent.state) {
      invariant(
        hasProperty(currentEvent, 'oldState'),
        errorMsgWithCurrentEvent(
          'when state changes, oldState field should be present'
        )
      );
      invariant(
        currentEvent.oldState === previousEvent.state,
        errorMsgWithBothEvents(
          "when state changes, oldState should be the same as previous event' state"
        )
      );
    }
  }

  return currentEvent;
}

type EventWithoutStates = Omit<GestureHandlerTestEvent, 'oldState' | 'state'>;
interface HandlerInfo {
  handlerType: HandlerNames;
  handlerTag: number;
}
function fillMissingDefaultsFor({
  handlerType,
  handlerTag,
}: HandlerInfo): (
  event: Partial<GestureHandlerTestEvent>
) => EventWithoutStates {
  return (event) => {
    return {
      ...handlersDefaultEvents[handlerType],
      ...event,
      handlerTag,
    };
  };
}

function isDiscreteHandler(handlerType: HandlerNames) {
  return (
    handlerType === 'TapGestureHandler' ||
    handlerType === 'LongPressGestureHandler'
  );
}

function fillMissingStatesTransitions(
  events: EventWithoutStates[],
  isDiscreteHandler: boolean
): EventWithoutStates[] {
  type Event = EventWithoutStates | null;
  const _events = [...events];
  const lastEvent = _events[_events.length - 1] ?? null;
  const firstEvent = _events[0] ?? null;

  const shouldDuplicateFirstEvent =
    !isDiscreteHandler && !hasState(State.BEGAN)(firstEvent);
  if (shouldDuplicateFirstEvent) {
    const duplicated = { ...firstEvent, state: State.BEGAN };
    // @ts-ignore badly typed, property may exist and we don't want to copy it
    delete duplicated.oldState;
    _events.unshift(duplicated);
  }

  const shouldDuplicateLastEvent =
    !hasState(State.END)(lastEvent) ||
    !hasState(State.FAILED)(lastEvent) ||
    !hasState(State.CANCELLED)(lastEvent);

  if (shouldDuplicateLastEvent) {
    const duplicated = { ...lastEvent, state: State.END };
    // @ts-ignore badly typed, property may exist and we don't want to copy it
    delete duplicated.oldState;
    _events.push(duplicated);
  }

  function isWithoutState(event: Event) {
    return event !== null && !hasProperty(event, 'state');
  }
  function hasState(state: State) {
    return (event: Event) => event !== null && event.state === state;
  }
  function noEventsLeft(event: Event) {
    return event === null;
  }

  function trueFn() {
    return true;
  }
  interface Args {
    shouldConsumeEvent?: (event: Event) => boolean;
    shouldTransitionToNextState?: (nextEvent: Event) => boolean;
  }
  function fillEventsForCurrentState({
    shouldConsumeEvent = trueFn,
    shouldTransitionToNextState = trueFn,
  }: Args) {
    function peekCurrentEvent(): Event {
      return _events[0] ?? null;
    }
    function peekNextEvent(): Event {
      return _events[1] ?? null;
    }
    function consumeCurrentEvent() {
      _events.shift();
    }
    const currentEvent = peekCurrentEvent();
    const nextEvent = peekNextEvent();
    const currentRequiredState = REQUIRED_EVENTS[currentStateIdx];

    let eventData = {};
    const shouldUseEvent = shouldConsumeEvent(currentEvent);
    if (shouldUseEvent) {
      eventData = currentEvent!;
      consumeCurrentEvent();
    }
    transformedEvents.push({ state: currentRequiredState, ...eventData });
    if (shouldTransitionToNextState(nextEvent)) {
      currentStateIdx++;
    }
  }

  const REQUIRED_EVENTS = [State.BEGAN, State.ACTIVE, State.END];

  let currentStateIdx = 0;
  const transformedEvents: EventWithoutStates[] = [];
  let hasAllStates;
  let iterations = 0;
  do {
    const nextRequiredState = REQUIRED_EVENTS[currentStateIdx];
    if (nextRequiredState === State.BEGAN) {
      fillEventsForCurrentState({
        shouldConsumeEvent: (e: Event) =>
          isWithoutState(e) || hasState(State.BEGAN)(e),
      });
    } else if (nextRequiredState === State.ACTIVE) {
      const shouldConsumeEvent = (e: Event) =>
        isWithoutState(e) || hasState(State.ACTIVE)(e);
      const shouldTransitionToNextState = (nextEvent: Event) =>
        noEventsLeft(nextEvent) ||
        hasState(State.END)(nextEvent) ||
        hasState(State.FAILED)(nextEvent) ||
        hasState(State.CANCELLED)(nextEvent);

      fillEventsForCurrentState({
        shouldConsumeEvent,
        shouldTransitionToNextState,
      });
    } else if (nextRequiredState === State.END) {
      fillEventsForCurrentState({});
    }
    hasAllStates = currentStateIdx === REQUIRED_EVENTS.length;

    invariant(
      iterations++ <= 500,
      'exceeded max number of iterations, please report a bug in RNGH repository with your test case'
    );
  } while (!hasAllStates);

  return transformedEvents;
}

type EventEmitter = (
  eventName: string,
  args: { nativeEvent: GestureHandlerTestEvent }
) => void;
interface HandlerData {
  emitEvent: EventEmitter;
  handlerType: HandlerNames;
  handlerTag: number;
  enabled: boolean | undefined;
}
function getHandlerData(
  componentOrGesture: ReactTestInstance | GestureType
): HandlerData {
  if (isGesture(componentOrGesture)) {
    const gesture = componentOrGesture;
    return {
      emitEvent: (eventName, args) => {
        DeviceEventEmitter.emit(eventName, args.nativeEvent);
      },
      handlerType: gesture.handlerName as HandlerNames,
      handlerTag: gesture.handlerTag,
      enabled: gesture.config.enabled,
    };
  }
  const gestureHandlerComponent = componentOrGesture;
  return {
    emitEvent: (eventName, args) => {
      fireEvent(gestureHandlerComponent, eventName, args);
    },
    handlerType: gestureHandlerComponent.props.handlerType as HandlerNames,
    handlerTag: gestureHandlerComponent.props.handlerTag as number,
    enabled: gestureHandlerComponent.props.enabled,
  };
}
type AllGestures =
  | TapGesture
  | PanGesture
  | LongPressGesture
  | RotationGesture
  | PinchGesture
  | FlingGesture
  | ForceTouchGesture
  | NativeGesture;

type AllHandlers =
  | TapGestureHandler
  | PanGestureHandler
  | LongPressGestureHandler
  | RotationGestureHandler
  | PinchGestureHandler
  | FlingGestureHandler
  | ForceTouchGestureHandler
  | NativeViewGestureHandler;

// prettier-ignore
type ClassComponentConstructor<P> = new (props: P) => React.Component<P, any, any>;

type ExtractPayloadFromProps<T> = T extends BaseGestureHandlerProps<
  infer TPayload
>
  ? TPayload
  : never;

type ExtractConfig<T> = T extends BaseGesture<infer TGesturePayload>
  ? TGesturePayload
  : T extends ClassComponentConstructor<infer THandlerProps>
  ? ExtractPayloadFromProps<THandlerProps>
  : Record<string, unknown>;

export function fireGestureHandler<THandler extends AllGestures | AllHandlers>(
  componentOrGesture: ReactTestInstance | GestureType,
  eventList: Partial<GestureHandlerTestEvent<ExtractConfig<THandler>>>[] = []
): void {
  const { emitEvent, handlerType, handlerTag, enabled } =
    getHandlerData(componentOrGesture);

  if (enabled === false) {
    return;
  }

  let _ = fillMissingStatesTransitions(
    eventList,
    isDiscreteHandler(handlerType)
  );
  _ = _.map(fillMissingDefaultsFor({ handlerTag, handlerType }));
  _ = withPrevAndCurrent(_, fillOldStateChanges);
  _ = withPrevAndCurrent(_, validateStateTransitions);
  // @ts-ignore TODO
  _ = _.map(wrapWithNativeEvent);

  const events = _ as unknown as WrappedGestureHandlerTestEvent[];

  const firstEvent = events.shift()!;

  emitEvent('onGestureHandlerStateChange', firstEvent);
  let lastSentEvent = firstEvent;
  for (const event of events) {
    const hasChangedState =
      lastSentEvent.nativeEvent.state !== event.nativeEvent.state;

    if (hasChangedState) {
      emitEvent('onGestureHandlerStateChange', event);
    } else {
      emitEvent('onGestureHandlerEvent', event);
    }
    lastSentEvent = event;
  }
}

export function getByGestureTestId(testID: string) {
  const handler = findHandlerByTestID(testID);
  if (handler === null) {
    throw new Error(`Handler with id: '${testID}' cannot be found`);
  }
  return handler;
}
