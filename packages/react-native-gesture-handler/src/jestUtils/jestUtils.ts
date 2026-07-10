import invariant from 'invariant';
import type { RefObject } from 'react';
import { DeviceEventEmitter } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { ActionType } from '../ActionType';
import type { FlingGestureHandler } from '../handlers/FlingGestureHandler';
import { flingHandlerName } from '../handlers/FlingGestureHandler';
import type { ForceTouchGestureHandler } from '../handlers/ForceTouchGestureHandler';
import { forceTouchHandlerName } from '../handlers/ForceTouchGestureHandler';
import type {
  BaseGestureHandlerProps,
  GestureEvent,
  HandlerStateChangeEvent,
} from '../handlers/gestureHandlerCommon';
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
import type { FlingGesture } from '../handlers/gestures/flingGesture';
import type { ForceTouchGesture } from '../handlers/gestures/forceTouchGesture';
import type { GestureType } from '../handlers/gestures/gesture';
import { BaseGesture } from '../handlers/gestures/gesture';
import type { LongPressGesture } from '../handlers/gestures/longPressGesture';
import type { NativeGesture } from '../handlers/gestures/nativeGesture';
import type { PanGesture } from '../handlers/gestures/panGesture';
import type { PinchGesture } from '../handlers/gestures/pinchGesture';
import type { RotationGesture } from '../handlers/gestures/rotationGesture';
import type { TapGesture } from '../handlers/gestures/tapGesture';
import { findHandlerByTestID } from '../handlers/handlersRegistry';
import type { LongPressGestureHandler } from '../handlers/LongPressGestureHandler';
import { longPressHandlerName } from '../handlers/LongPressGestureHandler';
import type { NativeViewGestureHandler } from '../handlers/NativeViewGestureHandler';
import { nativeViewHandlerName } from '../handlers/NativeViewGestureHandler';
import type { PanGestureHandler } from '../handlers/PanGestureHandler';
import { panHandlerName } from '../handlers/PanGestureHandler';
import type { PinchGestureHandler } from '../handlers/PinchGestureHandler';
import { pinchHandlerName } from '../handlers/PinchGestureHandler';
import type { RotationGestureHandler } from '../handlers/RotationGestureHandler';
import { rotationHandlerName } from '../handlers/RotationGestureHandler';
import type { TapGestureHandler } from '../handlers/TapGestureHandler';
import { tapHandlerName } from '../handlers/TapGestureHandler';
import { PointerType } from '../PointerType';
import { State } from '../State';
import { hasProperty, withPrevAndCurrent } from '../utils';
import { configureRelations } from '../v3/detectors/utils';
import {
  maybeUnpackValue,
  prepareConfigForNativeSide,
} from '../v3/hooks/utils';
import type { DetectorCallbacks, Gesture, SingleGesture } from '../v3/types';
import { Gestures } from '../web/Gestures';
import type IGestureHandler from '../web/handlers/IGestureHandler';
import type {
  AdaptedEvent,
  Config,
  PropsRef,
  ResultEvent,
} from '../web/interfaces';
import { EventTypes } from '../web/interfaces';
import type { GestureHandlerDelegate } from '../web/tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../web/tools/GestureHandlerOrchestrator';
import InteractionManager from '../web/tools/InteractionManager';

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
  TEventPayload extends Record<string, unknown> = Record<string, unknown>,
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
  componentOrGesture:
    | ReactTestInstance
    | GestureType
    | SingleGesture<any, any, any>
): componentOrGesture is GestureType {
  return componentOrGesture instanceof BaseGesture;
}

function isHookGesture(
  componentOrGesture: ReactTestInstance | SingleGesture<any, any, any>
): componentOrGesture is SingleGesture<any, any, any> {
  return 'detectorCallbacks' in componentOrGesture;
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
  componentOrGesture:
    | ReactTestInstance
    | GestureType
    | SingleGesture<any, any, any>
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

  if (isHookGesture(componentOrGesture)) {
    return {
      handlerType: componentOrGesture.type as HandlerNames,
      handlerTag: componentOrGesture.handlerTag,
      enabled: maybeUnpackValue<boolean>(componentOrGesture.config.enabled),
      emitEvent: (eventName, args) => {
        const { state, oldState, handlerTag, ...rest } = args.nativeEvent;

        const event = {
          state,
          handlerTag,
          handlerData: { ...rest },
        };

        if (eventName === 'onGestureHandlerStateChange') {
          componentOrGesture.detectorCallbacks.jsEventHandler?.({
            oldState: oldState as State,
            ...event,
          });
        } else if (eventName === 'onGestureHandlerEvent') {
          componentOrGesture.detectorCallbacks.jsEventHandler?.(event);
        }
      },
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

type ExtractPayloadFromProps<T> =
  T extends BaseGestureHandlerProps<infer TPayload> ? TPayload : never;

type ExtractConfig<T> =
  T extends BaseGesture<infer TGesturePayload>
    ? TGesturePayload
    : T extends ClassComponentConstructor<infer THandlerProps>
      ? ExtractPayloadFromProps<THandlerProps>
      : Record<string, unknown>;

type ExtractHookGesturePayload<T> = T extends {
  detectorCallbacks: DetectorCallbacks<any, infer TExtendedHandlerData>;
}
  ? TExtendedHandlerData
  : never;

type ExtractGestureControllerPayload<T> =
  T extends SingleGesture<any, any, any>
    ? ExtractHookGesturePayload<T>
    : T extends BaseGesture<any>
      ? ExtractConfig<T>
      : Record<string, unknown>;

export type GestureControllerEvent<
  TEventPayload extends Record<string, unknown> = Record<string, unknown>,
> = Partial<TEventPayload> & {
  handlerTag?: never;
  nativeEvent?: never;
  oldState?: never;
  state?: never;
};

type GestureControllerTarget =
  | ReactTestInstance
  | GestureType
  | SingleGesture<any, any, any>
  | string;

export interface GestureController<
  TEventPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  begin: (event?: GestureControllerEvent<TEventPayload>) => void;
  activate: (event?: GestureControllerEvent<TEventPayload>) => void;
  update: (event?: GestureControllerEvent<TEventPayload>) => void;
  end: (event?: GestureControllerEvent<TEventPayload>) => void;
  fail: (event?: GestureControllerEvent<TEventPayload>) => void;
  cancel: (event?: GestureControllerEvent<TEventPayload>) => void;
  getState: () => State;
}

const FORBIDDEN_CONTROLLER_EVENT_FIELDS = [
  'handlerTag',
  'nativeEvent',
  'oldState',
  'state',
];

function getStateName(state: State): string {
  return (
    Object.entries(State).find(([, value]) => value === state)?.[0] ??
    String(state)
  );
}

function validateControllerEvent(event: Record<string, unknown>) {
  for (const field of FORBIDDEN_CONTROLLER_EVENT_FIELDS) {
    invariant(
      !hasProperty(event, field),
      `createGestureController manages '${field}' internally. Pass only gesture event payload fields.`
    );
  }
}

function resolveGestureControllerTarget(target: GestureControllerTarget) {
  return typeof target === 'string' ? getByGestureTestId(target) : target;
}

class GestureControllerImpl<
  TEventPayload extends Record<string, unknown> = Record<string, unknown>,
> implements GestureController<TEventPayload>
{
  private state: State = State.UNDETERMINED;

  // eslint-disable-next-line no-useless-constructor
  constructor(private handlerData: HandlerData) {}

  public getState() {
    return this.state;
  }

  public begin(event: GestureControllerEvent<TEventPayload> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.transition('begin', State.BEGAN, [State.UNDETERMINED], event);
  }

  public activate(event: GestureControllerEvent<TEventPayload> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.transition('activate', State.ACTIVE, [State.BEGAN], event);
  }

  public update(event: GestureControllerEvent<TEventPayload> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.assertCurrentState('update', [State.ACTIVE]);

    const nativeEvent = this.buildEvent(State.ACTIVE, event);
    this.handlerData.emitEvent(
      'onGestureHandlerEvent',
      wrapWithNativeEvent(nativeEvent as GestureHandlerTestEvent)
    );
  }

  public end(event: GestureControllerEvent<TEventPayload> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.transition('end', State.END, [State.BEGAN, State.ACTIVE], event);
  }

  public fail(event: GestureControllerEvent<TEventPayload> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.transition('fail', State.FAILED, [State.BEGAN, State.ACTIVE], event);
  }

  public cancel(event: GestureControllerEvent<TEventPayload> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.transition(
      'cancel',
      State.CANCELLED,
      [State.BEGAN, State.ACTIVE],
      event
    );
  }

  private transition(
    action: string,
    nextState: State,
    allowedStates: State[],
    event: GestureControllerEvent<TEventPayload>
  ) {
    this.assertCurrentState(action, allowedStates);

    const oldState = this.state;
    this.state = nextState;

    const nativeEvent = {
      oldState,
      ...this.buildEvent(nextState, event),
    } as GestureHandlerTestEvent;

    this.handlerData.emitEvent(
      'onGestureHandlerStateChange',
      wrapWithNativeEvent(nativeEvent)
    );
  }

  private isEnabled() {
    return this.handlerData.enabled !== false;
  }

  private assertCurrentState(action: string, allowedStates: State[]) {
    invariant(
      allowedStates.includes(this.state),
      `Cannot ${action} gesture from ${getStateName(this.state)} state.`
    );
  }

  private buildEvent(
    state: State,
    event: GestureControllerEvent<TEventPayload>
  ): Omit<GestureHandlerTestEvent, 'oldState'> {
    validateControllerEvent(event);

    return fillMissingDefaultsFor(this.handlerData)({
      ...event,
      state,
    } as Partial<GestureHandlerTestEvent>) as Omit<
      GestureHandlerTestEvent,
      'oldState'
    >;
  }
}

export function createGestureController<
  TTarget extends GestureType | SingleGesture<any, any, any>,
>(
  componentOrGesture: TTarget
): GestureController<ExtractGestureControllerPayload<TTarget>>;
export function createGestureController<
  TEventPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  componentOrGesture: ReactTestInstance | string
): GestureController<TEventPayload>;
export function createGestureController(
  componentOrGesture: GestureControllerTarget
): GestureController<Record<string, unknown>> {
  const handlerData = getHandlerData(
    resolveGestureControllerTarget(componentOrGesture)
  );

  return new GestureControllerImpl(handlerData);
}

export type PointerPoint = {
  x: number;
  y: number;
};

export type PointerPath = {
  id?: number | undefined;
  start: PointerPoint;
  moves: readonly PointerPoint[];
};

type PointerEventStep = {
  type: 'down' | 'add' | 'move' | 'remove' | 'up';
  pointerId: number;
  at: PointerPoint;
};

type PointerWaitStep = {
  type: 'wait';
  duration: number;
};

export type PointerGesture = {
  steps: readonly (PointerEventStep | PointerWaitStep)[];
  timeStepMs: number;
};

export type PointerSequenceOptions = PointerPath & {
  timeStepMs?: number | undefined;
  holdForMs?: number | undefined;
};

export type MultiPointerSequenceOptions = {
  pointers: readonly [PointerPath, PointerPath, ...PointerPath[]];
  timeStepMs?: number | undefined;
};

export type SwipeOptions = {
  from: PointerPoint;
  to: PointerPoint;
  /** Number of MOVE samples between the initial DOWN and final UP. */
  steps?: number | undefined;
  timeStepMs?: number | undefined;
};

export type TapOptions = {
  at: PointerPoint;
  timeStepMs?: number | undefined;
};

export type LongPressOptions = TapOptions & {
  duration: number;
};

export type DoubleTapOptions = TapOptions & {
  delay?: number | undefined;
};

export type PinchOptions = {
  from: readonly [PointerPoint, PointerPoint];
  to: readonly [PointerPoint, PointerPoint];
  steps?: number | undefined;
  timeStepMs?: number | undefined;
};

export type RotationOptions = {
  center: PointerPoint;
  radius: number;
  fromAngle: number;
  toAngle: number;
  steps?: number | undefined;
  timeStepMs?: number | undefined;
};

export type FireGestureOptions = {
  /** Required by helpers that include a wait, such as longPress and doubleTap. */
  advanceTimers?: ((duration: number) => void) | undefined;
};

function validateTiming(timeStepMs: number): void {
  invariant(timeStepMs >= 0, 'timeStepMs must not be negative');
}

function interpolate(
  from: PointerPoint,
  to: PointerPoint,
  steps: number
): PointerPoint[] {
  invariant(
    Number.isInteger(steps) && steps > 0,
    'steps must be a positive integer'
  );

  return Array.from({ length: steps }, (_, index) => {
    const progress = (index + 1) / steps;

    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  });
}

/** Creates a single-pointer DOWN / MOVE* / UP sequence. */
export function pointerSequence({
  id = 1,
  start,
  moves,
  timeStepMs = 16,
  holdForMs = 0,
}: PointerSequenceOptions): PointerGesture {
  validateTiming(timeStepMs);
  invariant(holdForMs >= 0, 'holdForMs must not be negative');

  return {
    steps: [
      { type: 'down', pointerId: id, at: start },
      ...moves.map((at) => ({ type: 'move' as const, pointerId: id, at })),
      ...(holdForMs > 0
        ? [{ type: 'wait' as const, duration: holdForMs }]
        : []),
      { type: 'up', pointerId: id, at: moves[moves.length - 1] ?? start },
    ],
    timeStepMs,
  };
}

/**
 * Creates one shared pointer stream. Every pointer moves once per frame and
 * pointers are lifted in reverse order, matching browser touch semantics.
 */
export function multiPointerSequence({
  pointers,
  timeStepMs = 16,
}: MultiPointerSequenceOptions): PointerGesture {
  validateTiming(timeStepMs);

  const movesCount = pointers[0].moves.length;
  invariant(
    pointers.every((pointer) => pointer.moves.length === movesCount),
    'All multiPointerSequence paths must contain the same number of moves.'
  );

  const paths = pointers.map((pointer, index) => ({
    ...pointer,
    id: pointer.id ?? index + 1,
  }));
  const steps: (PointerEventStep | PointerWaitStep)[] = [
    { type: 'down', pointerId: paths[0].id, at: paths[0].start },
    ...paths.slice(1).map((pointer) => ({
      type: 'add' as const,
      pointerId: pointer.id,
      at: pointer.start,
    })),
  ];

  for (let index = 0; index < movesCount; index++) {
    paths.forEach((pointer) => {
      steps.push({
        type: 'move',
        pointerId: pointer.id,
        at: pointer.moves[index],
      });
    });
  }

  paths
    .slice(1)
    .reverse()
    .forEach((pointer) => {
      steps.push({
        type: 'remove',
        pointerId: pointer.id,
        at: pointer.moves[movesCount - 1] ?? pointer.start,
      });
    });
  steps.push({
    type: 'up',
    pointerId: paths[0].id,
    at: paths[0].moves[movesCount - 1] ?? paths[0].start,
  });

  return { steps, timeStepMs };
}

/**
 * Creates deterministic pointer input. Recognition is intentionally left to
 * the participating gesture handlers.
 */
export function swipe({
  from,
  to,
  steps = 1,
  timeStepMs = 16,
}: SwipeOptions): PointerGesture {
  return pointerSequence({
    start: from,
    moves: interpolate(from, to, steps),
    timeStepMs,
  });
}

export function tap({ at, timeStepMs }: TapOptions): PointerGesture {
  return pointerSequence({ start: at, moves: [], timeStepMs });
}

export function longPress({
  at,
  duration,
  timeStepMs,
}: LongPressOptions): PointerGesture {
  return pointerSequence({
    start: at,
    moves: [],
    holdForMs: duration,
    timeStepMs,
  });
}

export function doubleTap({
  at,
  delay = 50,
  timeStepMs = 16,
}: DoubleTapOptions): PointerGesture {
  validateTiming(timeStepMs);
  invariant(delay >= 0, 'doubleTap delay must not be negative');

  return {
    steps: [
      { type: 'down', pointerId: 1, at },
      { type: 'up', pointerId: 1, at },
      { type: 'wait', duration: delay },
      { type: 'down', pointerId: 1, at },
      { type: 'up', pointerId: 1, at },
    ],
    timeStepMs,
  };
}

export function pinch({
  from,
  to,
  steps = 2,
  timeStepMs,
}: PinchOptions): PointerGesture {
  return multiPointerSequence({
    pointers: [
      { start: from[0], moves: interpolate(from[0], to[0], steps) },
      { start: from[1], moves: interpolate(from[1], to[1], steps) },
    ],
    timeStepMs,
  });
}

export function rotate({
  center,
  radius,
  fromAngle,
  toAngle,
  steps = 2,
  timeStepMs,
}: RotationOptions): PointerGesture {
  invariant(radius > 0, 'rotate radius must be greater than zero');

  const pointAt = (angle: number): PointerPoint => ({
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  });
  const angles = interpolate(
    { x: fromAngle, y: 0 },
    { x: toAngle, y: 0 },
    steps
  ).map((point) => point.x);

  return multiPointerSequence({
    pointers: [
      { start: pointAt(fromAngle), moves: angles.map(pointAt) },
      {
        start: pointAt(fromAngle + Math.PI),
        moves: angles.map((angle) => pointAt(angle + Math.PI)),
      },
    ],
    timeStepMs,
  });
}

type PointerGestureTarget = Gesture<any, any, any> | string;

const NOOP = () => undefined;

class JestGestureHandlerDelegate
  implements GestureHandlerDelegate<object, IGestureHandler>
{
  public view: object | null;

  public constructor(view: object | null) {
    this.view = view;
  }

  public init = NOOP;
  public detach = NOOP;
  public updateDOM = NOOP;
  public reset = NOOP;
  public onBegin = NOOP;
  public onActivate = NOOP;
  public onEnd = NOOP;
  public onCancel = NOOP;
  public onFail = NOOP;
  public onEnabledChange = NOOP;
  public destroy = NOOP;

  public isPointerInBounds(): boolean {
    return true;
  }

  public measureView() {
    return { pageX: 0, pageY: 0, width: 100, height: 100 };
  }

  public absoluteToLocal(absoluteX: number, absoluteY: number) {
    return { x: absoluteX, y: absoluteY };
  }
}

type PointerEventHandler = IGestureHandler & {
  onPointerDown: (event: AdaptedEvent) => void;
  onPointerAdd: (event: AdaptedEvent) => void;
  onPointerMove: (event: AdaptedEvent) => void;
  onPointerRemove: (event: AdaptedEvent) => void;
  onPointerUp: (event: AdaptedEvent) => void;
};

function flattenGesture(
  gesture: Gesture<any, any, any>
): SingleGesture<any, any, any>[] {
  if ('gestures' in gesture) {
    return gesture.gestures.flatMap(flattenGesture);
  }

  return [gesture];
}

function resolvePointerGestureTarget(
  target: PointerGestureTarget
): Gesture<any, any, any> {
  const gesture =
    typeof target === 'string' ? getByGestureTestId(target) : target;

  invariant(
    typeof gesture === 'object' &&
      gesture !== null &&
      (hasProperty(gesture, 'detectorCallbacks') ||
        hasProperty(gesture, 'gestures')),
    'fireGesture accepts v3 hook gestures, composed gestures, or a v3 gesture test ID.'
  );

  return gesture as Gesture<any, any, any>;
}

function createAdaptedEvent(
  point: PointerPoint,
  eventType: EventTypes,
  pointerId: number,
  time: number
): AdaptedEvent {
  return {
    x: point.x,
    y: point.y,
    offsetX: point.x,
    offsetY: point.y,
    pointerId,
    pointerType: PointerType.TOUCH,
    eventType,
    time,
  };
}

function createPointerHandler(
  gesture: SingleGesture<any, any, any>,
  orchestrator: GestureHandlerOrchestrator,
  interactionManager: InteractionManager,
  view: object
): PointerEventHandler {
  const GestureHandler = Gestures[gesture.type as keyof typeof Gestures];
  invariant(
    GestureHandler !== undefined,
    `fireGesture does not support ${gesture.type} pointer recognition.`
  );

  const handler = new GestureHandler(
    new JestGestureHandlerDelegate(view)
  ) as unknown as PointerEventHandler;
  const onGestureEvent = (event: ResultEvent) => {
    gesture.detectorCallbacks.jsEventHandler?.(event.nativeEvent as never);
  };
  const propsRef = {
    current: {
      onGestureHandlerEvent: onGestureEvent,
      onGestureHandlerStateChange: onGestureEvent,
      onGestureHandlerTouchEvent: NOOP,
    },
  } as RefObject<PropsRef>;

  handler.handlerTag = gesture.handlerTag;
  handler.setGestureHandlerOrchestrator(orchestrator);
  handler.setInteractionManager(interactionManager);
  handler.setGestureConfig(
    prepareConfigForNativeSide(
      gesture.type,
      gesture.config
    ) as unknown as Config
  );
  handler.init(gesture.handlerTag, propsRef, ActionType.NATIVE_DETECTOR);

  return handler;
}

/**
 * Sends one pointer stream to all handlers in a v3 gesture or composition.
 * The web recognizers request transitions; GestureArbitrator determines which
 * of those transitions are observable after applying gesture relations.
 */
export function fireGesture(
  target: PointerGestureTarget,
  pointerGesture: PointerGesture,
  { advanceTimers }: FireGestureOptions = {}
): void {
  const gesture = resolvePointerGestureTarget(target);
  const gestures = flattenGesture(gesture);
  const orchestrator = new GestureHandlerOrchestrator();
  const interactionManager = new InteractionManager();
  const view = {};
  const relations = configureRelations(gesture);
  const handlers = gestures.map((singleGesture) => {
    const handler = createPointerHandler(
      singleGesture,
      orchestrator,
      interactionManager,
      view
    );
    interactionManager.configureInteractions(
      handler,
      relations.get(singleGesture.handlerTag) ?? singleGesture.gestureRelations
    );

    return handler;
  });

  invariant(
    pointerGesture.steps.length > 0,
    'fireGesture requires pointer input. Use tap(), swipe(), or pointerSequence().'
  );

  let time = 0;
  const pointerActions: Record<
    PointerEventStep['type'],
    {
      eventType: EventTypes;
      method: keyof Pick<
        PointerEventHandler,
        | 'onPointerDown'
        | 'onPointerAdd'
        | 'onPointerMove'
        | 'onPointerRemove'
        | 'onPointerUp'
      >;
    }
  > = {
    down: { eventType: EventTypes.DOWN, method: 'onPointerDown' },
    add: {
      eventType: EventTypes.ADDITIONAL_POINTER_DOWN,
      method: 'onPointerAdd',
    },
    move: { eventType: EventTypes.MOVE, method: 'onPointerMove' },
    remove: {
      eventType: EventTypes.ADDITIONAL_POINTER_UP,
      method: 'onPointerRemove',
    },
    up: { eventType: EventTypes.UP, method: 'onPointerUp' },
  };

  pointerGesture.steps.forEach((step) => {
    if (step.type === 'wait') {
      invariant(
        advanceTimers !== undefined,
        'fireGesture needs advanceTimers to process waits. Pass jest.advanceTimersByTime as the third argument.'
      );
      advanceTimers(step.duration);
      time += step.duration;
      return;
    }

    const { eventType, method } = pointerActions[step.type];
    const event = createAdaptedEvent(step.at, eventType, step.pointerId, time);
    handlers.forEach((handler) => handler[method](event));
    time += pointerGesture.timeStepMs;
  });
}

export function fireGestureHandler<THandler extends AllGestures | AllHandlers>(
  componentOrGesture:
    | ReactTestInstance
    | GestureType
    | SingleGesture<any, any, any>,
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
