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

const sendEvent = (
  handler: HandlerProperties,
  stateConfig: { oldState: number; state: number },
  baseEventData: Record<string, any>,
  eventData?: Record<string, any>
) => {
  handler.onHandlerStateChange({
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
  sendEvent(handler, { oldState: 0, state: 2 }, baseEventData, eventData);
};

const sendProgressEvent: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendEvent(handler, { oldState: 2, state: 4 }, baseEventData, eventData);
};

const sendEndEvent: SendEventWrapper = (handler, baseEventData, eventData) => {
  sendEvent(handler, { oldState: 4, state: 5 }, baseEventData, eventData);
};

const sendFailEvent: SendEventWrapper = (handler, baseEventData, eventData) => {
  sendEvent(handler, { oldState: 2, state: 1 }, baseEventData, eventData);
};

const sendCancelEvent: SendEventWrapper = (
  handler,
  baseEventData,
  eventData
) => {
  sendEvent(handler, { oldState: 4, state: 3 }, baseEventData, eventData);
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
  sendEvent(handler, states, baseEventData, eventData?.onFinish);
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
      for (const item of eventData!.configProgress) {
        sendProgressEvent(handler, baseEventData, item);
      }
    } else {
      sendProgressEvent(handler, baseEventData, eventData?.configProgress);
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
    return config.filter((handler) => handler.handlerType == handlerType);
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

// export const firePanGestureHandler = (
//   component: any,
//   configBegin?: PanConfig,
//   configProgress?: PanConfig | PanConfig[],
//   configEnd?: PanConfig,
//   userHandlerTag?: number
// ) => {
//   const handlerTag = resolveGestureHandlerTag(GestureHandlerType.PAN, component, userHandlerTag);
//   const eventData: Required<PanConfig> | { handlerTag: number } = {
//     handlerTag: handlerTag,
//     x: 0,
//     y: 0,
//     absoluteX: 0,
//     absoluteY: 0,
//     translationX: 0,
//     translationY: 0,
//     velocityX: 0,
//     velocityY: 0,
//   };
//   runEventsSequence(
//     component,
//     eventData,
//     configBegin,
//     configProgress,
//     configEnd
//   );
// };

// export const fireLongPressGestureHandler = (
//   component: any,
//   configBegin?: LongPressConfig,
//   configProgress?: LongPressConfig | LongPressConfig[],
//   configEnd?: LongPressConfig,
//   userHandlerTag?: number
// ) => {
//   const handlerTag = resolveGestureHandlerTag(GestureHandlerType.LONG_PRESS, component, userHandlerTag);
//   const eventData: Required<LongPressConfig> | { handlerTag: number } = {
//     handlerTag: handlerTag,
//     x: 0,
//     y: 0,
//     absoluteX: 0,
//     absoluteY: 0,
//     duration: 0,
//   };
//   runEventsSequence(
//     component,
//     eventData,
//     configBegin,
//     configProgress,
//     configEnd
//   );
// };

// export const fireRotationGestureHandler = (
//   component: any,
//   configBegin?: RotationConfig,
//   configProgress?: RotationConfig | RotationConfig[],
//   configEnd?: RotationConfig,
//   userHandlerTag?: number
// ) => {
//   const handlerTag = resolveGestureHandlerTag(GestureHandlerType.ROTATION, component, userHandlerTag);
//   const eventData: Required<RotationConfig> | { handlerTag: number } = {
//     handlerTag: handlerTag,
//     rotation: 0,
//     velocity: 0,
//     anchorX: 0,
//     anchorY: 0,
//   };
//   runEventsSequence(
//     component,
//     eventData,
//     configBegin,
//     configProgress,
//     configEnd
//   );
// };

// export const fireFlingGestureHandler = (
//   component: any,
//   configBegin?: TapConfig,
//   configProgress?: TapConfig | TapConfig[],
//   configEnd?: TapConfig,
//   userHandlerTag?: number
// ) => {
//   const handlerTag = resolveGestureHandlerTag(GestureHandlerType.FLING, component, userHandlerTag);
//   const eventData: Required<TapConfig> | { handlerTag: number } = {
//     handlerTag: handlerTag,
//     x: 0,
//     y: 0,
//     absoluteX: 0,
//     absoluteY: 0,
//   };
//   runEventsSequence(
//     component,
//     eventData,
//     configBegin,
//     configProgress,
//     configEnd
//   );
// };

// export const firePinchGestureHandler = (
//   component: any,
//   configBegin?: PinchConfig,
//   configProgress?: PinchConfig | PinchConfig[],
//   configEnd?: PinchConfig,
//   userHandlerTag?: number
// ) => {
//   const handlerTag = resolveGestureHandlerTag(GestureHandlerType.PINCH, component, userHandlerTag);
//   const eventData: Required<PinchConfig> | { handlerTag: number } = {
//     handlerTag: handlerTag,
//     scale: 0,
//     velocity: 0,
//     focalX: 0,
//     focalY: 0,
//   };
//   runEventsSequence(
//     component,
//     eventData,
//     configBegin,
//     configProgress,
//     configEnd
//   );
// };

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
