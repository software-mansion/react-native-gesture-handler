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

const sendBeginEvent = (component: any, config?: Record<string, any>) => {};

const sendProgressEvent = (component: any, config?: Record<string, any>) => {};

const sendEndEvent = (component: any, config?: Record<string, any>) => {};

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
  // simulate undetermined -> begin state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
    },
  });

  // simulate begin -> active state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
    },
  });

  // simulate active -> end state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
    },
  });
};

export const fireGestureHandlerPan = (
  component: any,
  handlerTag: number,
  configBegin?: PanConfig,
  configProgress?: PanConfig,
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

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
      ...configBegin,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
      ...configProgress,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
      ...configEnd,
    },
  });
};

export const fireGestureHandlerLongPress = (
  component: any,
  handlerTag: number,
  configBegin?: LongPressConfig,
  configProgress?: LongPressConfig,
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

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
      ...configBegin,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
      ...configProgress,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
      ...configEnd,
    },
  });
};

export const fireGestureHandlerRotation = (
  component: any,
  handlerTag: number,
  configBegin?: RotationConfig,
  configProgress?: RotationConfig,
  configEnd?: RotationConfig
) => {
  const eventData: Required<RotationConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    rotation: 0,
    velocity: 0,
    anchorX: 0,
    anchorY: 0,
  };

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
      ...configBegin,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
      ...configProgress,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
      ...configEnd,
    },
  });
};

export const fireGestureHandlerFling = (
  component: any,
  handlerTag: number,
  configBegin?: TapConfig,
  configEnd?: TapConfig
) => {
  const eventData: Required<TapConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
  };

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
      ...configBegin,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
      ...configEnd,
    },
  });
};

export const fireGestureHandlerPinch = (
  component: any,
  handlerTag: number,
  configBegin?: PinchConfig,
  configProgress?: PinchConfig,
  configEnd?: PinchConfig
) => {
  const eventData: Required<PinchConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    scale: 0,
    velocity: 0,
    focalX: 0,
    focalY: 0,
  };

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
      ...configBegin,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
      ...configProgress,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
      ...configEnd,
    },
  });
};

export const fireGestureHandlerForceTouch = (
  component: any,
  handlerTag: number,
  configBegin?: ForceTouchConfig,
  configProgress?: ForceTouchConfig,
  configEnd?: ForceTouchConfig
) => {
  const eventData: Required<ForceTouchConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    force: 0,
  };

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 0,
      state: 2,
      ...eventData,
      ...configBegin,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 2,
      state: 4,
      ...eventData,
      ...configProgress,
    },
  });

  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      oldState: 4,
      state: 5,
      ...eventData,
      ...configEnd,
    },
  });
};
