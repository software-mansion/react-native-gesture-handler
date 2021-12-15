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
  config?: LongPressConfig
) => {
  const eventData: Required<LongPressConfig> | { handlerTag: number } = {
    handlerTag: handlerTag,
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    duration: 0,
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
      ...eventdata,
    },
  });
};
