import { fireEvent } from '@testing-library/react-native';

export const fireGestureHandlerEvent = (
  component: any,
  name: string,
  config: any
) => {
  fireEvent(component, name, config);
};

export enum EventDataTypeV1 {
  onStart = 0,
  onActive = 1,
  onEnd = 2,
  onFail = 3,
  onCancel = 4,
  onFinish = 5,
}

// todo: EventDataTypeV2

export interface BaseConfig {
  type?: EventDataTypeV1;
}

export interface TapConfig extends BaseConfig {
  type?: EventDataTypeV1;
  x?: number;
  y?: number;
  absoluteX?: number;
  absoluteY?: number;
}

export interface PanConfig extends TapConfig {
  translationX?: number;
  translationY?: number;
  velocityX?: number;
  velocityY?: number;
}

export interface LongPressConfig extends TapConfig {
  duration?: number;
}

export interface RotationConfig {
  rotation?: number;
  velocity?: number;
  anchorX?: number;
  anchorY?: number;
}

export interface PinchConfig {
  scale?: number;
  velocity?: number;
  focalX?: number;
  focalY?: number;
}

interface HandlerProperties {
  handlerType: string;
  tag: number;
  onGestureEvent: (event: any) => void;
  onHandlerStateChange: (event: any) => void;
}

export interface FireGestureHandlerConfig<T> {
  configBegin?: T;
  configProgress?: T | T[];
  configEnd?: T;
  onFail?: T;
  onCancel?: T;
  onFinish?: T;
}

type SendEventWrapper = (
  handler: HandlerProperties,
  baseEventData: Record<string, any>,
  eventData?: Record<string, any>
) => void;

const sendStateChangeEvent = (
  handler: HandlerProperties,
  stateConfig: { oldState: number; state: number },
  baseEventData: Record<string, any>,
  eventData?: Record<string, any>
) => {
  if (typeof handler?.onHandlerStateChange !== 'function') {
    return;
  }
  handler.onHandlerStateChange({
    nativeEvent: {
      ...stateConfig,
      ...baseEventData,
      ...eventData,
      handlerTag: handler.tag,
    },
  });
};

const sendEvent = (
  handler: HandlerProperties,
  stateConfig: { state: number },
  baseEventData: Record<string, any>,
  eventData?: Record<string, any>
) => {
  if (typeof handler?.onGestureEvent !== 'function') {
    return;
  }
  handler.onGestureEvent({
    nativeEvent: {
      ...stateConfig,
      ...baseEventData,
      ...eventData,
      handlerTag: handler.tag,
    },
  });
};

const sendBeginEvent: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendStateChangeEvent(
    handler,
    { oldState: 0, state: 2 },
    baseEventData,
    eventData
  );
};

const sendProgressEventFirst: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendStateChangeEvent(
    handler,
    { oldState: 2, state: 4 },
    baseEventData,
    eventData
  );
};

const sendProgressEvent: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendEvent(handler, { state: 4 }, baseEventData, eventData);
};

const sendEndEvent: SendEventWrapper = (handler, baseEventData, eventData) => {
  sendStateChangeEvent(
    handler,
    { oldState: 4, state: 5 },
    baseEventData,
    eventData
  );
};

// const sendFailEvent: SendEventWrapper = (handler, baseEventData, eventData) => {
//   sendStateChangeEvent(
//     handler,
//     { oldState: 2, state: 1 },
//     baseEventData,
//     eventData
//   );
// };

// const sendCancelEvent: SendEventWrapper = (
//   handler,
//   baseEventData,
//   eventData
// ) => {
//   sendStateChangeEvent(
//     handler,
//     { oldState: 4, state: 3 },
//     baseEventData,
//     eventData
//   );
// };

// const sendFinishEvent = (
//   handler: HandlerProperties,
//   baseEventData: Record<string, any>,
//   eventData?: FireGestureHandlerConfig<any>
// ) => {
//   let states = { oldState: -1, state: -1 };
//   if (eventData?.onFail) {
//     states = { oldState: 2, state: 1 };
//   } else if (eventData?.onCancel) {
//     states = { oldState: 2, state: 2 };
//   } else {
//     states = { oldState: 2, state: 1 };
//   }
//   sendStateChangeEvent(handler, states, baseEventData, eventData?.onFinish);
// };

const runEventsSequence = <T extends TapConfig | RotationConfig>(
  testId: number,
  baseEventData: Record<string, any>,
  eventDataStream?: Partial<T>[]
) => {
  // todo: EventDataTypeV1
  const handler = getGestureHandler(testId);
  const streamLenght = Array.isArray(eventDataStream)
    ? eventDataStream.length
    : 0;
  const beginEventData = streamLenght > 0 ? eventDataStream![0] : {};
  const progressEventDataFirst = streamLenght > 2 ? eventDataStream![1] : {};
  const progressEventsData = streamLenght > 2 ? [eventDataStream![1]] : [{}];
  const endEventData =
    streamLenght > 0 ? eventDataStream![streamLenght - 1] : {};

  // for (const item in eventDataStream) {
  // todo: onFail, onCancel, onFinish
  // }

  for (let i = 2; i < streamLenght - 1; i++) {
    progressEventsData.push(eventDataStream![i]);
  }
  sendBeginEvent(handler, baseEventData, beginEventData);
  sendProgressEventFirst(handler, baseEventData, progressEventDataFirst);
  for (const eventData of progressEventsData) {
    sendProgressEvent(handler, baseEventData, eventData);
  }
  sendEndEvent(handler, baseEventData, endEventData);
};

const getGestureHandler = (testId: number): any => {
  // todo: any
  const registry = (global as { JestGestureHandlerRegistry?: any })
    .JestGestureHandlerRegistry; // todo: any
  const handler = registry.get(testId);
  if (handler) {
    return handler;
  }
  throw Error(
    'Unable to resolve gesture handler tag, are you sure that you added prop testId to your gesture hndler?'
  );
};

export const fireTapGestureHandler = (
  testId: number,
  eventDataStream?: TapConfig[]
) => {
  runEventsSequence<Required<TapConfig>>(
    testId,
    {
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
    },
    eventDataStream
  );
};

export const firePanGestureHandler = (
  testId: number,
  eventDataStream?: PanConfig[]
) => {
  runEventsSequence<Required<PanConfig>>(
    testId,
    {
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
      translationX: 0,
      translationY: 0,
      velocityX: 0,
      velocityY: 0,
    },
    eventDataStream
  );
};

export const fireLongPressGestureHandler = (
  testId: number,
  eventDataStream?: LongPressConfig[]
) => {
  runEventsSequence<Required<LongPressConfig>>(
    testId,
    {
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
      duration: 0,
    },
    eventDataStream
  );
};

export const fireRotationGestureHandler = (
  testId: number,
  eventDataStream?: RotationConfig[]
) => {
  runEventsSequence<Required<RotationConfig>>(
    testId,
    {
      rotation: 0,
      velocity: 0,
      anchorX: 0,
      anchorY: 0,
    },
    eventDataStream
  );
};

export const fireFlingGestureHandler = (
  testId: number,
  eventDataStream?: TapConfig[]
) => {
  runEventsSequence<Required<TapConfig>>(
    testId,
    {
      x: 0,
      y: 0,
      absoluteX: 0,
      absoluteY: 0,
    },
    eventDataStream
  );
};

export const firePinchGestureHandler = (
  testId: number,
  eventDataStream?: PinchConfig[]
) => {
  runEventsSequence<Required<PinchConfig>>(
    testId,
    {
      scale: 0,
      velocity: 0,
      focalX: 0,
      focalY: 0,
    },
    eventDataStream
  );
};

export function isJest(): boolean {
  return !!process.env.JEST_WORKER_ID;
}

export type JestGestureHandlerRegistryType = {
  add: (config: any) => void;
  remove: (_: any) => void;
  get: (testId: number) => void;
};

const registry: any = {};

export const JestGestureHandlerRegistry: JestGestureHandlerRegistryType = {
  add: (config: any) => {
    registry[config.handlerTag] = config;
  },
  remove: (_: any) => {},
  get: (testId: any) => {
    return registry[testId];
  },
};
