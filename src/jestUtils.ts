import { fireEvent } from '@testing-library/react-native';
import invariant from 'invariant';
import { DeviceEventEmitter } from 'react-native';
import { ReactTestInstance } from 'react-test-renderer';
import {
  FlingGestureHandler,
  FlingGestureHandlerEventPayload,
  flingHandlerName,
} from './handlers/FlingGestureHandler';
import {
  ForceTouchGestureHandler,
  ForceTouchGestureHandlerEventPayload,
  forceTouchHandlerName,
} from './handlers/ForceTouchGestureHandler';
import {
  BaseGestureHandlerProps,
  GestureEvent,
  HandlerStateChangeEvent,
} from './handlers/gestureHandlerCommon';
import { FlingGesture } from './handlers/gestures/flingGesture';
import { ForceTouchGesture } from './handlers/gestures/forceTouchGesture';
import { BaseGesture, GestureType } from './handlers/gestures/gesture';
import { LongPressGesture } from './handlers/gestures/longPressGesture';
import { NativeGesture } from './handlers/gestures/nativeGesture';
import { PanGesture } from './handlers/gestures/panGesture';
import { PinchGesture } from './handlers/gestures/pinchGesture';
import { RotationGesture } from './handlers/gestures/rotationGesture';
import { TapGesture } from './handlers/gestures/tapGesture';
import { findHandlerByTestID } from './handlers/handlersRegistry';
import {
  LongPressGestureHandler,
  LongPressGestureHandlerEventPayload,
  longPressHandlerName,
} from './handlers/LongPressGestureHandler';
import {
  NativeViewGestureHandler,
  NativeViewGestureHandlerPayload,
  nativeViewHandlerName,
} from './handlers/NativeViewGestureHandler';
import {
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  panHandlerName,
} from './handlers/PanGestureHandler';
import {
  PinchGestureHandler,
  PinchGestureHandlerEventPayload,
  pinchHandlerName,
} from './handlers/PinchGestureHandler';
import {
  RotationGestureHandler,
  RotationGestureHandlerEventPayload,
  rotationHandlerName,
} from './handlers/RotationGestureHandler';
import {
  TapGestureHandler,
  TapGestureHandlerEventPayload,
  tapHandlerName,
} from './handlers/TapGestureHandler';
import { State } from './State';
import { hasProperty, withPrevAndCurrent } from './utils';

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
      oldState: previousEvent.state,
      ...currentEvent,
    } as GestureHandlerTestEvent;
  } else {
    return currentEvent as GestureHandlerTestEvent;
  }
}

function fillMissingActiveStateFields(
  previousEvent: Omit<GestureHandlerTestEvent, 'oldState'> | null,
  currentEvent: Omit<GestureHandlerTestEvent, 'state' | 'oldState'>
) {
  const isFirstEvent = previousEvent === null;
  if (isFirstEvent) {
    return currentEvent;
  }
  if (
    previousEvent.state === State.ACTIVE &&
    !hasProperty(currentEvent, 'state')
  ) {
    return {
      state: State.ACTIVE,
      ...currentEvent,
    };
  }
  return currentEvent;
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

interface HandlerInfo {
  handlerType: HandlerNames;
  handlerTag: number;
}
function fillMissingDefaultsFor({
  handlerType,
  handlerTag,
}: HandlerInfo): (
  event: Partial<GestureHandlerTestEvent>
) => Omit<GestureHandlerTestEvent, 'state' | 'oldState'> {
  return (event) => {
    return {
      ...handlersDefaultEvents[handlerType],
      ...event,
      handlerTag,
    };
  };
}

type EventEmitter = (
  eventName: string,
  args: { nativeEvent: GestureHandlerTestEvent }
) => void;
interface HandlerData {
  emitEvent: EventEmitter;
  handlerType: HandlerNames;
  handlerTag: number;
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
    };
  }
  const gestureHandlerComponent = componentOrGesture;
  return {
    emitEvent: (eventName, args) => {
      fireEvent(gestureHandlerComponent, eventName, args);
    },
    handlerType: gestureHandlerComponent.props.handlerType as HandlerNames,
    handlerTag: gestureHandlerComponent.props.handlerTag as number,
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
  eventList: Partial<GestureHandlerTestEvent<ExtractConfig<THandler>>>[]
): void {
  const { emitEvent, handlerType, handlerTag } = getHandlerData(
    componentOrGesture
  );

  let _ = eventList.map(fillMissingDefaultsFor({ handlerTag, handlerType }));
  _ = withPrevAndCurrent(_, fillMissingActiveStateFields);
  _ = withPrevAndCurrent(_, fillOldStateChanges);
  _ = withPrevAndCurrent(_, validateStateTransitions);
  // @ts-ignore TODO
  _ = _.map(wrapWithNativeEvent);

  const events = (_ as unknown) as WrappedGestureHandlerTestEvent[];

  const firstEvent = events.shift();
  invariant(
    firstEvent !== undefined && events.length !== 0,
    'Events list must contain at least two events.'
  ); // TODO: provide defaults

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

export function getByHandlerId(testID: string) {
  const handler = findHandlerByTestID(testID);
  if (handler === null) {
    throw new Error(`Handler with id: '${testID}' cannot be found`);
  }
  return handler;
}
