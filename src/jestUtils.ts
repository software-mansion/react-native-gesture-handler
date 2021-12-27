import { fireEvent } from '@testing-library/react-native';

export const fireGestureHandlerEvent = (
  component: any,
  name: string,
  config: any
) => {
  fireEvent(component, name, config);
};

export interface TapConfig {
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

export enum GestureHandlerType {
  TAP = 'TapGestureHandler',
  PAN = 'PanGestureHandler',
  LONG_PRESS = 'LongPressGestureHandler',
  ROTATION = 'RotationGestureHandler',
  FLING = 'FlingGestureHandler',
  PINCH = 'PinchGestureHandler',
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

const sendFinishEvent = (
  handler: HandlerProperties,
  baseEventData: Record<string, any>,
  eventData?: FireGestureHandlerConfig<any>
) => {
  let states = { oldState: -1, state: -1 };
  if (eventData?.onFail) {
    states = { oldState: 2, state: 1 };
  } else if (eventData?.onCancel) {
    states = { oldState: 2, state: 2 };
  } else {
    states = { oldState: 2, state: 1 };
  }
  sendStateChangeEvent(handler, states, baseEventData, eventData?.onFinish);
};

const runEventsSequence = <T>(
  component: any,
  eventType: GestureHandlerType,
  baseEventData: Record<string, any>,
  eventData?: FireGestureHandlerConfig<T>
) => {
  const handlers = getGestureHandlers(eventType, component);
  handlers.forEach((handler) => {
    sendBeginEvent(handler, baseEventData, eventData?.configBegin);
  });

  handlers.forEach((handler) => {
    baseEventData.handlerTag = handler.tag;
    if (Array.isArray(eventData?.configProgress)) {
      let index = 0;
      for (const item of eventData!.configProgress) {
        if (index === 0) {
          sendProgressEventFirst(
            handler,
            baseEventData,
            eventData?.configProgress
          );
        } else {
          sendProgressEvent(handler, baseEventData, item);
        }
        index++;
      }
    } else {
      sendProgressEventFirst(handler, baseEventData, eventData?.configProgress);
    }
  });

  handlers.forEach((handler) => {
    sendEndEvent(handler, baseEventData, eventData?.configEnd);
  });

  handlers.forEach((handler) => {
    sendFailEvent(handler, baseEventData, eventData?.onFail);
  });

  handlers.forEach((handler) => {
    sendCancelEvent(handler, baseEventData, eventData?.onCancel);
  });

  handlers.forEach((handler) => {
    sendFinishEvent(handler, baseEventData, eventData);
  });
};

const getGestureHandlers = (
  handlerType: GestureHandlerType,
  component: any
): HandlerProperties[] => {
  const config: HandlerProperties[] =
    component?._fiber?.stateNode?.props?.ghTagContainer;
  if (config) {
    return config.filter((handler) => handler.handlerType === handlerType);
  }
  throw Error(
    'Unable to resolve gesture handler tag, are you sure that you added {...ghTagEventMacro()} to your component?'
  );
};

export const fireTapGestureHandler = (
  component: any,
  eventData?: FireGestureHandlerConfig<TapConfig>
) => {
  const baseEventData: Required<TapConfig> = {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
  };
  runEventsSequence(
    component,
    GestureHandlerType.TAP,
    baseEventData,
    eventData
  );
};

export const firePanGestureHandler = (
  component: any,
  eventData?: FireGestureHandlerConfig<PanConfig>
) => {
  const baseEventData: Required<PanConfig> = {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    translationX: 0,
    translationY: 0,
    velocityX: 0,
    velocityY: 0,
  };
  runEventsSequence(
    component,
    GestureHandlerType.PAN,
    baseEventData,
    eventData
  );
};

export const fireLongPressGestureHandler = (
  component: any,
  eventData?: FireGestureHandlerConfig<LongPressConfig>
) => {
  const baseEventData: Required<LongPressConfig> = {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    duration: 0,
  };
  runEventsSequence(
    component,
    GestureHandlerType.LONG_PRESS,
    baseEventData,
    eventData
  );
};

export const fireRotationGestureHandler = (
  component: any,
  eventData?: FireGestureHandlerConfig<RotationConfig>
) => {
  const baseEventData: Required<RotationConfig> = {
    rotation: 0,
    velocity: 0,
    anchorX: 0,
    anchorY: 0,
  };
  runEventsSequence(
    component,
    GestureHandlerType.ROTATION,
    baseEventData,
    eventData
  );
};

export const fireFlingGestureHandler = (
  component: any,
  eventData?: FireGestureHandlerConfig<RotationConfig>
) => {
  const baseEventData: Required<TapConfig> = {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
  };
  runEventsSequence(
    component,
    GestureHandlerType.FLING,
    baseEventData,
    eventData
  );
};

export const firePinchGestureHandler = (
  component: any,
  eventData?: FireGestureHandlerConfig<RotationConfig>
) => {
  const baseEventData: Required<PinchConfig> = {
    scale: 0,
    velocity: 0,
    focalX: 0,
    focalY: 0,
  };
  runEventsSequence(
    component,
    GestureHandlerType.PINCH,
    baseEventData,
    eventData
  );
};

export const decorateChildrenWithTag = (
  component: any,
  handlerProperties: HandlerProperties
) => {
  if (!component) return;
  if (component.props.ghTagContainer !== undefined) {
    component.props.ghTagContainer.push(handlerProperties);
  }
  if (Array.isArray(component.props.children)) {
    for (const child of component.props.children) {
      decorateChildrenWithTag(child, handlerProperties);
    }
  } else if (typeof component.props.children === 'object') {
    decorateChildrenWithTag(component.props.children, handlerProperties);
  }
};

export const ghTagEventMacro = () => ({
  ghTagContainer: [],
});
