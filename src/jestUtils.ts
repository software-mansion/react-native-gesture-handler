import { fireEvent } from '@testing-library/react-native';
import invariant from 'invariant';
import { ReactTestInstance } from 'react-test-renderer';
import {
  FlingGestureHandlerEventPayload,
  flingHandlerName,
} from './handlers/FlingGestureHandler';
import {
  ForceTouchGestureHandlerEventPayload,
  forceTouchHandlerName,
} from './handlers/ForceTouchGestureHandler';
import {
  GestureEvent,
  HandlerStateChangeEvent,
} from './handlers/gestureHandlerCommon';
import {
  LongPressGestureHandlerEventPayload,
  longPressHandlerName,
} from './handlers/LongPressGestureHandler';
import {
  NativeViewGestureHandlerPayload,
  nativeViewHandlerName,
} from './handlers/NativeViewGestureHandler';
import {
  PanGestureHandlerEventPayload,
  panHandlerName,
} from './handlers/PanGestureHandler';
import {
  PinchGestureHandlerEventPayload,
  pinchHandlerName,
} from './handlers/PinchGestureHandler';
import {
  RotationGestureHandlerEventPayload,
  rotationHandlerName,
} from './handlers/RotationGestureHandler';
import {
  TapGestureHandlerEventPayload,
  tapHandlerName,
} from './handlers/TapGestureHandler';
import { State } from './State';

type GestureHandlerTestEvent = (
  | GestureEvent
  | HandlerStateChangeEvent
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

export function fireGestureHandlerEvent(
  component: ReactTestInstance,
  eventList: Partial<GestureHandlerTestEvent>[]
): void {
  // TODO improvement: traverse components and find nearest gesture handler
  // instead of relying that handler is passed directly as component

  // ReactTestInstance is typed with any
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const handlerType: HandlerNames = component.props.handlerType;

  function fillMissingDefaults(
    event: Partial<GestureHandlerTestEvent>
  ): Omit<GestureHandlerTestEvent, 'state' | 'oldState'> {
    return {
      ...handlersDefaultEvents[handlerType],
      ...event,
    };
  }

  function fillOldStateChanges(
    previousEvent: GestureHandlerTestEvent | null,
    currentEvent: Omit<GestureHandlerTestEvent, 'state' | 'oldState'>
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

  function wrapWithNativeEvent(event: GestureHandlerTestEvent) {
    return { nativeEvent: event };
  }

  const events = eventList
    .map(fillMissingDefaults)
    .map((currentEvent, i, events) => {
      const previousEvent =
        i > 0 ? (events[i - 1] as GestureHandlerTestEvent) : null;
      return fillOldStateChanges(previousEvent, currentEvent);
    })
    .map(wrapWithNativeEvent);

  const firstEvent = events.shift();
  invariant(
    firstEvent !== undefined && events.length !== 0,
    'Events list must contain at least two events.'
  ); // TODO: provide defaults

  fireEvent(component, 'onGestureHandlerStateChange', firstEvent);
  let lastSentEvent = firstEvent;
  for (const event of events) {
    const hasChangedState =
      lastSentEvent.nativeEvent.state !== event.nativeEvent.state;

    if (hasChangedState) {
      fireEvent(component, 'onGestureHandlerStateChange', event);
    } else {
      fireEvent(component, 'onGestureHandlerEvent', event);
    }
    lastSentEvent = event;
  }
}

// export enum EventTypeV1 {
//   onStart = 'onStart',
//   onActive = 'onActive',
//   onEnd = 'onEnd',
//   onFail = 'onFail',
//   onCancel = 'onCancel',
//   onFinish = 'onFinish',
// }

// export enum EventTypeV2 {
//   onBegin = 'onBegin',
//   onStart = 'onStart',
//   onEnd = 'onEnd',
//   onFinalize = 'onFinalize',
//   onTouchesDown = 'onTouchesDown',
//   onTouchesMove = 'onTouchesMove',
//   onTouchesUp = 'onTouchesUp',
//   onTouchesCancelled = 'onTouchesCancelled',
// }

export function isJest(): boolean {
  return !!process.env.JEST_WORKER_ID;
}
