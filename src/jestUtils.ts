import { fireEvent } from '@testing-library/react-native';

export const fireGestureHandlerEvent = (
  component: any,
  name: string,
  config: any
) => {
  fireEvent(component, name, config);
};

export enum EventDataTypeV1 {
  onStart = 'onStart',
  onActive = 'onActive',
  onEnd = 'onEnd',
  onFail = 'onFail',
  onCancel = 'onCancel',
  onFinish = 'onFinish',
}

export enum EventDataTypeV2 {
  onBegin = 'onBegin',
  onStart = 'onStart',
  onEnd = 'onEnd',
  onFinalize = 'onFinalize',
  onTouchesDown = 'onTouchesDown',
  onTouchesMove = 'onTouchesMove',
  onTouchesUp = 'onTouchesUp',
  onTouchesCancelled = 'onTouchesCancelled',
}

export interface BaseConfig {
  type?: EventDataTypeV1 | EventDataTypeV2;
}

export interface TapConfig extends BaseConfig {
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

export interface RotationConfig extends BaseConfig {
  rotation?: number;
  velocity?: number;
  anchorX?: number;
  anchorY?: number;
}

export interface PinchConfig extends BaseConfig {
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

const sendFailEvent: SendEventWrapper = (handler, baseEventData, eventData) => {
  sendStateChangeEvent(
    handler,
    { oldState: 2, state: 1 },
    baseEventData,
    eventData
  );
};

const sendCancelEvent: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendStateChangeEvent(
    handler,
    { oldState: 4, state: 3 },
    baseEventData,
    eventData
  );
};

const sendFinishEvent: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendStateChangeEvent(
    handler,
    { oldState: 2, state: 1 },
    baseEventData,
    eventData
  );
};

const runEventsSequence = <T extends TapConfig | RotationConfig>(
  testId: number,
  baseEventData: Record<string, any>,
  eventDataStream: Partial<T>[] = []
) => {
  const handler = getGestureHandler(testId);
  if ((handler as GHHandler).type === 'v1') {
    runEventsSequenceV1(handler, baseEventData, eventDataStream);
  } else {
    runEventsSequenceV2(handler, baseEventData, eventDataStream);
  }
};

const filterEventData = <T extends TapConfig | RotationConfig>(
  eventDataStream: Partial<T>[] = []
) => {
  const filteredStream: Partial<T>[] = [];
  const withType: Partial<T>[] = [];
  for (const item of eventDataStream) {
    if (item.type) {
      withType.push(item);
    } else {
      filteredStream.push(item);
    }
  }
  return [withType, filteredStream];
};

const runEventsSequenceV1 = <T extends TapConfig | RotationConfig>(
  handler: any, // todo: any
  baseEventData: Record<string, any>,
  eventDataStream: Partial<T>[] = []
) => {
  const [withTypeV1, filteredStream] = filterEventData(eventDataStream);
  const streamLenght = filteredStream.length;

  let beginEventData = streamLenght > 0 ? filteredStream![0] : {};
  let progressEventDataFirst = streamLenght > 2 ? filteredStream![1] : {};
  let progressEventsData = streamLenght > 2 ? [filteredStream![1]] : [{}];
  for (let i = 2; i < streamLenght - 1; i++) {
    progressEventsData.push(filteredStream![i]);
  }
  let endEventData = streamLenght > 0 ? filteredStream![streamLenght - 1] : {};
  let cancelEventData = null;
  let failEventData = null;
  let finishEventData = null;

  let isFirstOnActive = true;
  for (const item of withTypeV1) {
    if (item.type == EventDataTypeV1.onActive) {
      if (streamLenght <= 2 && isFirstOnActive) {
        progressEventDataFirst = item;
        if (progressEventsData.length == 1) {
          progressEventsData = [];
        }
      }
      progressEventsData.push(item);
      isFirstOnActive = false;
    }
    if (item.type == EventDataTypeV1.onStart) {
      beginEventData = item;
    }
    if (item.type == EventDataTypeV1.onEnd) {
      endEventData = item;
    }
    if (item.type == EventDataTypeV1.onCancel) {
      cancelEventData = item;
    }
    if (item.type == EventDataTypeV1.onFail) {
      failEventData = item;
    }
    if (item.type == EventDataTypeV1.onFinish) {
      finishEventData = item;
    }
  }

  sendBeginEvent(handler, baseEventData, beginEventData);
  sendProgressEventFirst(handler, baseEventData, progressEventDataFirst);
  for (const eventData of progressEventsData) {
    sendProgressEvent(handler, baseEventData, eventData);
  }

  if (cancelEventData) {
    sendCancelEvent(handler, baseEventData, cancelEventData);
  }
  if (failEventData) {
    sendFailEvent(handler, baseEventData, failEventData);
  }
  if (finishEventData || cancelEventData || failEventData) {
    sendFinishEvent(
      handler,
      baseEventData,
      finishEventData ? finishEventData : {}
    );
  }

  if (!(cancelEventData && failEventData && finishEventData)) {
    sendEndEvent(handler, baseEventData, endEventData);
  }
};

const runEventsSequenceV2 = <T extends TapConfig | RotationConfig>(
  config: any, // todo: any
  baseEventData: Record<string, any>,
  eventDataStream: Partial<T>[] = []
) => {
  // const [withType, filteredStream] = filterEventData(eventDataStream);
  baseEventData;
  eventDataStream;
  // let onBeginData = {};
  // let onStartData = {};
  // let onEndData = {};
  // let onFinalizeData = {};
  if (config.handlers.onBegin) {
    config.handlers.onBegin({});
  }
  if (config.handlers.onStart) {
    config.handlers.onStart({});
  }
  if (config.handlers.onEnd) {
    config.handlers.onEnd({});
  }
  if (config.handlers.onFinalize) {
    config.handlers.onFinalize({});
  }
  if (config.handlers.onTouchesDown) {
    config.handlers.onTouchesDown({});
  }
  if (config.handlers.onTouchesMove) {
    config.handlers.onTouchesMove({});
  }
  if (config.handlers.onTouchesUp) {
    config.handlers.onTouchesUp({});
  }
  if (config.handlers.onTouchesCancelled) {
    config.handlers.onTouchesCancelled({});
  }
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

interface GHHandler {
  type: string;
  // todo
}

type JestGestureHandlerRegistryType = {
  add: (config: GHHandler) => void;
  get: (testId: number) => any;
};

let registry: Record<string, GHHandler> = {};

export const JestGestureHandlerRegistry: JestGestureHandlerRegistryType = {
  add: (config: GHHandler) => {
    let testId = 0;
    if (config.type === 'v1') {
      testId = (config as any).handlerTag;
    } else {
      testId = (config as any).config.testId;
    }
    if (registry[testId]) {
      throw Error(
        '[gesture-handler] duplicate of testId, make you sure that you use "resetGestureHandlerRegistry()" before test'
      );
    }
    registry[testId] = config; // todo: any
  },
  get: (testId: any): any => {
    return registry[testId];
  },
};

export const resetGestureHandlerRegistry = (): void => {
  registry = {};
};
