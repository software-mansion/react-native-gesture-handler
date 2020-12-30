// Previous types exported gesture handlers as classes which creates an interface and variable, both named the same as class.
// Without those types, we'd introduce breaking change, forcing users to prefix every handler type specification with typeof
// e.g. React.createRef<TapGestureHandler> -> React.createRef<typeof TapGestureHandler>.
// See https://www.typescriptlang.org/docs/handbook/classes.html#constructor-functions for reference.
import React from 'react';

import createHandler from './createHandler';
import PlatformConstants from '../PlatformConstants';
import State from '../State';
import { ValueOf } from '../typeUtils';

export interface GestureEventPayload {
  handlerTag: number;
  numberOfPointers: number;
  state: ValueOf<typeof State>;
}

export interface HandlerStateChangeEventPayload {
  handlerTag: number;
  numberOfPointers: number;
  state: ValueOf<typeof State>;
  oldState: ValueOf<typeof State>;
}

//TODO(TS) events in handlers

export interface GestureEvent<ExtraEventPayloadT = Record<string, unknown>> {
  nativeEvent: Readonly<GestureEventPayload & ExtraEventPayloadT>;
}
export interface HandlerStateChangeEvent<
  ExtraEventPayloadT = Record<string, unknown>
> {
  nativeEvent: Readonly<HandlerStateChangeEventPayload & ExtraEventPayloadT>;
}

// Events payloads are types instead of interfaces due to TS limitation.
// See https://github.com/microsoft/TypeScript/issues/15300 for more info.
export type BaseGestureHandlerProperties<
  ExtraEventPayloadT extends Record<string, unknown> = Record<string, unknown>
> = {
  id?: string;
  enabled?: boolean;
  minPointers?: number;
  waitFor?: React.Ref<unknown> | React.Ref<unknown>[];
  simultaneousHandlers?: React.Ref<unknown> | React.Ref<unknown>[];
  shouldCancelWhenOutside?: boolean;
  hitSlop?:
    | number
    // TODO(TS) take into consideration types from GestureHandler#setHitSlop
    | Partial<
        Record<
          'left' | 'right' | 'top' | 'bottom' | 'vertical' | 'horizontal',
          number
        >
      >
    | Record<'width' | 'left', number>
    | Record<'width' | 'right', number>
    | Record<'height' | 'top', number>
    | Record<'height' | 'bottom', number>;
  // TODO(TS) - fix event types
  onBegan?: (event: HandlerStateChangeEvent) => void;
  onFailed?: (event: HandlerStateChangeEvent) => void;
  onCancelled?: (event: HandlerStateChangeEvent) => void;
  onActivated?: (event: HandlerStateChangeEvent) => void;
  onEnded?: (event: HandlerStateChangeEvent) => void;

  //TODO(TS) consider using NativeSyntheticEvent
  onGestureEvent?: (event: GestureEvent<ExtraEventPayloadT>) => void;
  onHandlerStateChange?: (
    event: HandlerStateChangeEvent<ExtraEventPayloadT>
  ) => void;
};

export const baseProperties = [
  'id',
  'enabled',
  'minPointers',
  'waitFor',
  'simultaneousHandlers',
  'shouldCancelWhenOutside',
  'hitSlop',
  'onBegan',
  'onFailed',
  'onCancelled',
  'onActivated',
  'onEnded',
  'onGestureEvent',
  'onHandlerStateChange',
] as const;

export type TapGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface TapGestureHandlerProperties
  extends BaseGestureHandlerProperties<TapGestureHandlerEventPayload> {
  minPointers?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  numberOfTaps?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  maxDist?: number;
}

export type TapGestureHandler = typeof TapGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const TapGestureHandler = createHandler<
  TapGestureHandlerProperties,
  TapGestureHandlerEventPayload
>({
  name: 'TapGestureHandler',
  allowedProps: [
    ...baseProperties,
    'maxDurationMs',
    'maxDelayMs',
    'numberOfTaps',
    'maxDeltaX',
    'maxDeltaY',
    'maxDist',
    'minPointers',
  ] as const,
  config: {},
});

export type FlingGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface FlingGestureHandlerProperties
  extends BaseGestureHandlerProperties<FlingGestureHandlerEventPayload> {
  direction?: number;
  numberOfPointers?: number;
}

export type FlingGestureHandler = typeof FlingGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const FlingGestureHandler = createHandler<
  FlingGestureHandlerProperties,
  FlingGestureHandlerEventPayload
>({
  name: 'FlingGestureHandler',
  allowedProps: [...baseProperties, 'numberOfPointers', 'direction'] as const,
  config: {},
});

class ForceTouchFallback extends React.Component {
  static forceTouchAvailable = false;
  componentDidMount() {
    console.warn(
      'ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase'
    );
  }
  render() {
    return this.props.children;
  }
}

export type ForceTouchGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  force: number;
};

export interface ForceTouchGestureHandlerProperties
  extends BaseGestureHandlerProperties<ForceTouchGestureHandlerEventPayload> {
  minForce?: number;
  maxForce?: number;
  feedbackOnActivation?: boolean;
}

export type ForceTouchGestureHandler = typeof ForceTouchGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const ForceTouchGestureHandler = PlatformConstants?.forceTouchAvailable
  ? createHandler<
      ForceTouchGestureHandlerProperties,
      ForceTouchGestureHandlerEventPayload
    >({
      name: 'ForceTouchGestureHandler',
      allowedProps: [
        ...baseProperties,
        'minForce',
        'maxForce',
        'feedbackOnActivation',
      ] as const,
      config: {},
    })
  : ForceTouchFallback;

type ExtendedForceTouchGestureHandler = typeof ForceTouchGestureHandler & {
  forceTouchAvailable: boolean;
};

// TODO(TS): decide if not hacky
(ForceTouchGestureHandler as ExtendedForceTouchGestureHandler).forceTouchAvailable =
  PlatformConstants?.forceTouchAvailable || false;

export type LongPressGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface LongPressGestureHandlerProperties
  extends BaseGestureHandlerProperties<LongPressGestureHandlerEventPayload> {
  minDurationMs?: number;
  maxDist?: number;
}

export type LongPressGestureHandler = typeof LongPressGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const LongPressGestureHandler = createHandler<
  LongPressGestureHandlerProperties,
  LongPressGestureHandlerEventPayload
>({
  name: 'LongPressGestureHandler',
  allowedProps: [...baseProperties, 'minDurationMs', 'maxDist'] as const,
  config: {},
});

function validatePanGestureHandlerProps(props: PanGestureHandlerProperties) {
  if (props.minDeltaX && props.activeOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.maxDeltaX && props.failOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.minDeltaY && props.activeOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (props.maxDeltaY && props.failOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (
    Array.isArray(props.activeOffsetX) &&
    (props.activeOffsetX[0] > 0 || props.activeOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.activeOffsetY) &&
    (props.activeOffsetY[0] > 0 || props.activeOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetY should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetX) &&
    (props.failOffsetX[0] > 0 || props.failOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetY) &&
    (props.failOffsetY[0] > 0 || props.failOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetY should be negative, a the second one should be positive`
    );
  }
}

function transformPanGestureHandlerProps(props: PanGestureHandlerProperties) {
  type InternalPanGHKeys =
    | 'activeOffsetXStart'
    | 'activeOffsetXEnd'
    | 'failOffsetXStart'
    | 'failOffsetXEnd'
    | 'activeOffsetYStart'
    | 'activeOffsetYEnd'
    | 'failOffsetYStart'
    | 'failOffsetYEnd';
  type PanGestureHandlerInternalProperties = PanGestureHandlerProperties &
    Partial<Record<InternalPanGHKeys, number>>;

  const res: PanGestureHandlerInternalProperties = { ...props };
  if (props.minDeltaX !== undefined) {
    delete res.minDeltaX;
    res.activeOffsetXStart = -props.minDeltaX;
    res.activeOffsetXEnd = props.minDeltaX;
  }
  if (props.maxDeltaX !== undefined) {
    delete res.maxDeltaX;
    res.failOffsetXStart = -props.maxDeltaX;
    res.failOffsetXEnd = props.maxDeltaX;
  }
  if (props.minOffsetX !== undefined) {
    delete res.minOffsetX;
    if (props.minOffsetX < 0) {
      res.activeOffsetXStart = props.minOffsetX;
    } else {
      res.activeOffsetXEnd = props.minOffsetX;
    }
  }

  if (props.minDeltaY !== undefined) {
    delete res.minDeltaY;
    res.activeOffsetYStart = -props.minDeltaY;
    res.activeOffsetYEnd = props.minDeltaY;
  }
  if (props.maxDeltaY !== undefined) {
    delete res.maxDeltaY;
    res.failOffsetYStart = -props.maxDeltaY;
    res.failOffsetYEnd = props.maxDeltaY;
  }

  if (props.minOffsetY !== undefined) {
    delete res.minOffsetY;
    if (props.minOffsetY < 0) {
      res.activeOffsetYStart = props.minOffsetY;
    } else {
      res.activeOffsetYEnd = props.minOffsetY;
    }
  }

  if (props.activeOffsetX !== undefined) {
    delete res.activeOffsetX;
    if (Array.isArray(props.activeOffsetX)) {
      res.activeOffsetXStart = props.activeOffsetX[0];
      res.activeOffsetXEnd = props.activeOffsetX[1];
    } else if (props.activeOffsetX < 0) {
      res.activeOffsetXStart = props.activeOffsetX;
    } else {
      res.activeOffsetXEnd = props.activeOffsetX;
    }
  }

  if (props.activeOffsetY !== undefined) {
    delete res.activeOffsetY;
    if (Array.isArray(props.activeOffsetY)) {
      res.activeOffsetYStart = props.activeOffsetY[0];
      res.activeOffsetYEnd = props.activeOffsetY[1];
    } else if (props.activeOffsetY < 0) {
      res.activeOffsetYStart = props.activeOffsetY;
    } else {
      res.activeOffsetYEnd = props.activeOffsetY;
    }
  }

  if (props.failOffsetX !== undefined) {
    delete res.failOffsetX;
    if (Array.isArray(props.failOffsetX)) {
      res.failOffsetXStart = props.failOffsetX[0];
      res.failOffsetXEnd = props.failOffsetX[1];
    } else if (props.failOffsetX < 0) {
      res.failOffsetXStart = props.failOffsetX;
    } else {
      res.failOffsetXEnd = props.failOffsetX;
    }
  }

  if (props.failOffsetY !== undefined) {
    delete res.failOffsetY;
    if (Array.isArray(props.failOffsetY)) {
      res.failOffsetYStart = props.failOffsetY[0];
      res.failOffsetYEnd = props.failOffsetY[1];
    } else if (props.failOffsetY < 0) {
      res.failOffsetYStart = props.failOffsetY;
    } else {
      res.failOffsetYEnd = props.failOffsetY;
    }
  }

  return res;
}

function managePanProps(props: PanGestureHandlerProperties) {
  if (__DEV__) {
    validatePanGestureHandlerProps(props);
  }
  return transformPanGestureHandlerProps(props);
}

export type PanGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
};

export interface PanGestureHandlerProperties
  extends BaseGestureHandlerProperties<PanGestureHandlerEventPayload> {
  /** @deprecated  use activeOffsetX*/
  minDeltaX?: number;
  /** @deprecated  use activeOffsetY*/
  minDeltaY?: number;
  /** @deprecated  use failOffsetX*/
  maxDeltaX?: number;
  /** @deprecated  use failOffsetY*/
  maxDeltaY?: number;
  /** @deprecated  use activeOffsetX*/
  minOffsetX?: number;
  /** @deprecated  use failOffsetY*/
  minOffsetY?: number;
  activeOffsetY?: number | number[];
  activeOffsetX?: number | number[];
  failOffsetY?: number | number[];
  failOffsetX?: number | number[];
  minDist?: number;
  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;
  minPointers?: number;
  maxPointers?: number;
  avgTouches?: boolean;
  enableTrackpadTwoFingerGesture?: boolean;
}

export type PanGestureHandler = typeof PanGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const PanGestureHandler = createHandler<
  PanGestureHandlerProperties,
  PanGestureHandlerEventPayload
>({
  name: 'PanGestureHandler',
  allowedProps: [
    ...baseProperties,
    'activeOffsetY',
    'activeOffsetX',
    'failOffsetY',
    'failOffsetX',
    'minDist',
    'minVelocity',
    'minVelocityX',
    'minVelocityY',
    'minPointers',
    'maxPointers',
    'avgTouches',
    'enableTrackpadTwoFingerGesture',
  ] as const,
  config: {},
  transformProps: managePanProps,
  customNativeProps: [
    'activeOffsetYStart',
    'activeOffsetYEnd',
    'activeOffsetXStart',
    'activeOffsetXEnd',
    'failOffsetYStart',
    'failOffsetYEnd',
    'failOffsetXStart',
    'failOffsetXEnd',
  ],
});

export type PinchGestureHandlerEventPayload = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
};

export interface PinchGestureHandlerProperties
  extends BaseGestureHandlerProperties<PinchGestureHandlerEventPayload> {}

export type PinchGestureHandler = typeof PinchGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const PinchGestureHandler = createHandler<
  PinchGestureHandlerProperties,
  PinchGestureHandlerEventPayload
>({
  name: 'PinchGestureHandler',
  allowedProps: baseProperties,
  config: {},
});

export type RotationGestureHandlerEventPayload = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
};

export interface RotationGestureHandlerProperties
  extends BaseGestureHandlerProperties<RotationGestureHandlerEventPayload> {}

export type RotationGestureHandler = typeof RotationGestureHandler;
// For the reason why, see the comment at the top of this file
// eslint-disable-next-line no-redeclare
export const RotationGestureHandler = createHandler<
  RotationGestureHandlerProperties,
  RotationGestureHandlerEventPayload
>({
  name: 'RotationGestureHandler',
  allowedProps: baseProperties,
  config: {},
});
