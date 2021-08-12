// Previous types exported gesture handlers as classes which creates an interface and variable, both named the same as class.
// Without those types, we'd introduce breaking change, forcing users to prefix every handler type specification with typeof
// e.g. React.createRef<TapGestureHandler> -> React.createRef<typeof TapGestureHandler>.
// See https://www.typescriptlang.org/docs/handbook/classes.html#constructor-functions for reference.
import * as React from 'react';

import createHandler from './createHandler';
import PlatformConstants from '../PlatformConstants';
import { State } from '../State';
import { ValueOf } from '../typeUtils';
import {
  baseGestureHandlerProps,
  tapGestureHandlerProps,
  flingGestureHandlerProps,
  forceTouchGestureHandlerProps,
  longPressGestureHandlerProps,
  panGestureHandlerProps,
  panGestureHandlerCustomNativeProps,
  managePanProps,
} from './allowedProps';

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
export type BaseGestureHandlerProps<
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

export type TapGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface TapGestureHandlerProps
  extends BaseGestureHandlerProps<TapGestureHandlerEventPayload> {
  minPointers?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  numberOfTaps?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  maxDist?: number;
}

export type TapGestureHandler = typeof TapGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const TapGestureHandler = createHandler<
  TapGestureHandlerProps,
  TapGestureHandlerEventPayload
>({
  name: 'TapGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...tapGestureHandlerProps,
  ] as const,
  config: {},
});

export type FlingGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface FlingGestureHandlerProps
  extends BaseGestureHandlerProps<FlingGestureHandlerEventPayload> {
  direction?: number;
  numberOfPointers?: number;
}

export type FlingGestureHandler = typeof FlingGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const FlingGestureHandler = createHandler<
  FlingGestureHandlerProps,
  FlingGestureHandlerEventPayload
>({
  name: 'FlingGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...flingGestureHandlerProps,
  ] as const,
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

export interface ForceTouchGestureHandlerProps
  extends BaseGestureHandlerProps<ForceTouchGestureHandlerEventPayload> {
  minForce?: number;
  maxForce?: number;
  feedbackOnActivation?: boolean;
}

export type ForceTouchGestureHandler = typeof ForceTouchGestureHandler & {
  forceTouchAvailable: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const ForceTouchGestureHandler = PlatformConstants?.forceTouchAvailable
  ? createHandler<
      ForceTouchGestureHandlerProps,
      ForceTouchGestureHandlerEventPayload
    >({
      name: 'ForceTouchGestureHandler',
      allowedProps: [
        ...baseGestureHandlerProps,
        ...forceTouchGestureHandlerProps,
      ] as const,
      config: {},
    })
  : ForceTouchFallback;

(ForceTouchGestureHandler as ForceTouchGestureHandler).forceTouchAvailable =
  PlatformConstants?.forceTouchAvailable || false;

export type LongPressGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  duration: number;
};

export interface LongPressGestureHandlerProps
  extends BaseGestureHandlerProps<LongPressGestureHandlerEventPayload> {
  minDurationMs?: number;
  maxDist?: number;
}

export type LongPressGestureHandler = typeof LongPressGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const LongPressGestureHandler = createHandler<
  LongPressGestureHandlerProps,
  LongPressGestureHandlerEventPayload
>({
  name: 'LongPressGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...longPressGestureHandlerProps,
  ] as const,
  config: {},
});

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

export interface PanGestureHandlerProps
  extends BaseGestureHandlerProps<PanGestureHandlerEventPayload> {
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
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const PanGestureHandler = createHandler<
  PanGestureHandlerProps,
  PanGestureHandlerEventPayload
>({
  name: 'PanGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...panGestureHandlerProps,
  ] as const,
  config: {},
  transformProps: managePanProps,
  customNativeProps: panGestureHandlerCustomNativeProps,
});

export type PinchGestureHandlerEventPayload = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
};

export interface PinchGestureHandlerProps
  extends BaseGestureHandlerProps<PinchGestureHandlerEventPayload> {}

export type PinchGestureHandler = typeof PinchGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const PinchGestureHandler = createHandler<
  PinchGestureHandlerProps,
  PinchGestureHandlerEventPayload
>({
  name: 'PinchGestureHandler',
  allowedProps: baseGestureHandlerProps,
  config: {},
});

export type RotationGestureHandlerEventPayload = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
};

export interface RotationGestureHandlerProps
  extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload> {}

export type RotationGestureHandler = typeof RotationGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const RotationGestureHandler = createHandler<
  RotationGestureHandlerProps,
  RotationGestureHandlerEventPayload
>({
  name: 'RotationGestureHandler',
  allowedProps: baseGestureHandlerProps,
  config: {},
});
