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

export interface ForceTouchConfig {
  force?: number;
}

const sendBeginEvent = (component: any, eventData?: Record<string, any>) => {
  // simulate undetermined -> begin state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
    },
  });
};

const sendProgressEvent = (component: any, eventData?: Record<string, any>) => {
  // simulate begin -> active state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
    },
  });
};

const sendEndEvent = (component: any, eventData?: Record<string, any>) => {
  // simulate active -> end state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
    },
  });
};

const runEventsSequence = (
  component: any,
  eventData?: Record<string, any>,
  configBegin?: Record<string, any>,
  configProgress?: Record<string, any> | Array<Record<string, any>>,
  configEnd?: Record<string, any>
) => {
  sendBeginEvent(component, { ...eventData, ...configBegin });
  if (Array.isArray(configProgress)) {
    for (const item of configProgress) {
      sendProgressEvent(component, { ...eventData, ...item });
    }
  } else {
    sendProgressEvent(component, { ...eventData, ...configProgress });
  }
  sendEndEvent(component, { ...eventData, ...configEnd });
};

export const fireGestureHandlerTap = (
  component: any,
  handlerTag: number,
  config?: TapConfig
) => {
  const eventData: Required<TapConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    ...config,
  };

  sendBeginEvent(component, eventData);
  sendProgressEvent(component, eventData);
  sendEndEvent(component, eventData);
};

export const fireGestureHandlerPan = (
  component: any,
  handlerTag: number,
  configBegin?: PanConfig,
  configProgress?: PanConfig | Array<PanConfig>,
  configEnd?: PanConfig
) => {
  const eventData: Required<PanConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
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
    eventData,
    configBegin,
    configProgress,
    configEnd
  );
};

export const fireGestureHandlerLongPress = (
  component: any,
  handlerTag: number,
  configBegin?: LongPressConfig,
  configProgress?: LongPressConfig | Array<LongPressConfig>,
  configEnd?: LongPressConfig
) => {
  const eventData: Required<LongPressConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    duration: 0,
  };
  runEventsSequence(
    component,
    eventData,
    configBegin,
    configProgress,
    configEnd
  );
};

export const fireGestureHandlerRotation = (
  component: any,
  handlerTag: number,
  configBegin?: RotationConfig,
  configProgress?: RotationConfig | Array<RotationConfig>,
  configEnd?: RotationConfig
) => {
  const eventData: Required<RotationConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    rotation: 0,
    velocity: 0,
    anchorX: 0,
    anchorY: 0,
  };
  runEventsSequence(
    component,
    eventData,
    configBegin,
    configProgress,
    configEnd
  );
};

export const fireGestureHandlerFling = (
  component: any,
  handlerTag: number,
  configBegin?: TapConfig,
  configProgress?: TapConfig | Array<TapConfig>,
  configEnd?: TapConfig
) => {
  const eventData: Required<TapConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
  };
  runEventsSequence(
    component,
    eventData,
    configBegin,
    configProgress,
    configEnd
  );
};

export const fireGestureHandlerPinch = (
  component: any,
  handlerTag: number,
  configBegin?: PinchConfig,
  configProgress?: PinchConfig | Array<PinchConfig>,
  configEnd?: PinchConfig
) => {
  const eventData: Required<PinchConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    scale: 0,
    velocity: 0,
    focalX: 0,
    focalY: 0,
  };
  runEventsSequence(
    component,
    eventData,
    configBegin,
    configProgress,
    configEnd
  );
};

export const fireGestureHandlerForceTouch = (
  component: any,
  handlerTag: number,
  configBegin?: ForceTouchConfig,
  configProgress?: ForceTouchConfig | Array<ForceTouchConfig>,
  configEnd?: ForceTouchConfig
) => {
  const eventData: Required<ForceTouchConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    force: 0,
  };
  runEventsSequence(
    component,
    eventData,
    configBegin,
    configProgress,
    configEnd
  );
};
