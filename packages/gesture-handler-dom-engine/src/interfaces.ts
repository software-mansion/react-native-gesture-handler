import type { Directions } from '@swmansion/gesture-handler-core/src/Directions';
import type {
  ActiveCursor,
  GestureTouchEvent,
  MouseButton,
  StylusData,
  TouchAction,
  UserSelect,
} from '@swmansion/gesture-handler-core/src/handlers/gestureHandlerCommon';
import type { NormalizedHitSlop } from '@swmansion/gesture-handler-core/src/handlers/hitSlop';
import type { PointerType } from '@swmansion/gesture-handler-core/src/PointerType';
import type { State } from '@swmansion/gesture-handler-core/src/State';
import type {
  GestureStateChangeEventWithHandlerData,
  GestureUpdateEventWithHandlerData,
} from '@swmansion/gesture-handler-core/src/v3/types';
import type { RefObject } from 'react';

export interface Handler {
  handlerTag: number;
}

type ConfigArgs =
  | number
  | boolean
  | string
  | NormalizedHitSlop
  | UserSelect
  | TouchAction
  | ActiveCursor
  | Directions
  | Handler[]
  | null
  | undefined;

export interface Config extends Record<string, ConfigArgs> {
  enabled: boolean;
  simultaneousHandlers?: Handler[] | null | undefined;
  waitFor?: Handler[] | null | undefined;
  blocksHandlers?: Handler[] | null | undefined;
  hitSlop?: NormalizedHitSlop | null | undefined;
  shouldCancelWhenOutside?: boolean | undefined;
  userSelect?: UserSelect | undefined;
  activeCursor?: ActiveCursor | undefined;
  mouseButton?: MouseButton | undefined;
  enableContextMenu?: boolean | undefined;
  touchAction?: TouchAction | undefined;
  manualActivation?: boolean | undefined;
  dispatchesAnimatedEvents?: false | undefined;
  dispatchesReanimatedEvents?: boolean | undefined;
  needsPointerData?: false | undefined;
  testID?: string | undefined;

  activateAfterLongPress?: number;
  failOffsetXStart?: number;
  failOffsetYStart?: number;
  failOffsetXEnd?: number;
  failOffsetYEnd?: number;
  activeOffsetXStart?: number;
  activeOffsetXEnd?: number;
  activeOffsetYStart?: number;
  activeOffsetYEnd?: number;
  minPointers?: number;
  maxPointers?: number;
  minDist?: number;
  minDistSq?: number;
  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;
  minVelocitySq?: number;
  maxDist?: number;
  maxDistSq?: number;
  numberOfPointers?: number;
  minDurationMs?: number;
  numberOfTaps?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
  yieldsToContinuousGestures?: boolean;
  hasLongPressHandler?: boolean;
  longPressDuration?: number;
  direction?: Directions;
  enableTrackpadTwoFingerGesture?: boolean;
}

type NativeEventArgs = number | State | boolean | undefined;
export interface GestureHandlerNativeEvent
  extends Record<string, NativeEventArgs> {
  numberOfPointers: number;
  state: State;
  handlerTag: number;
  oldState?: State | undefined;
  pointerType: PointerType;
}

export interface Point {
  x: number;
  y: number;
}

export interface PointerData {
  id: number;
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
}

// Native event has to stay for v2 compatibility
type ResultEventType =
  | GestureUpdateEventWithHandlerData<unknown>
  | GestureStateChangeEventWithHandlerData<unknown>
  | GestureTouchEvent
  | GestureHandlerNativeEvent;

export interface ResultEvent<T extends ResultEventType = ResultEventType>
  extends Record<string, T | number> {
  nativeEvent: T;
  timeStamp: number;
}

export interface PropsRef {
  onGestureHandlerEvent: (e: ResultEvent) => void;
  onGestureHandlerStateChange: (e: ResultEvent) => void;
  onGestureHandlerTouchEvent: (e: ResultEvent) => void;
  onGestureHandlerReanimatedEvent?: (e: ResultEvent) => void;
  onGestureHandlerReanimatedStateChange?: (e: ResultEvent) => void;
  onGestureHandlerReanimatedTouchEvent?: (e: ResultEvent) => void;
  onGestureHandlerAnimatedEvent?: (e: ResultEvent) => void;
}

export interface AdaptedEvent {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  eventType: EventTypes;
  pointerType: PointerType;
  time: number;
  button?: MouseButton | undefined;
  stylusData?: StylusData | undefined;
  wheelDeltaY?: number | undefined;
}

export const EventTypes = {
  DOWN: 0,
  ADDITIONAL_POINTER_DOWN: 1,
  UP: 2,
  ADDITIONAL_POINTER_UP: 3,
  MOVE: 4,
  ENTER: 5,
  LEAVE: 6,
  CANCEL: 7,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type EventTypes = (typeof EventTypes)[keyof typeof EventTypes];

export const WheelDevice = {
  UNDETERMINED: 0,
  MOUSE: 1,
  TOUCHPAD: 2,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type WheelDevice = (typeof WheelDevice)[keyof typeof WheelDevice];

export type GestureHandlerRef = {
  viewTag: GestureHandlerRef;
  current: HTMLElement;
};

export type SVGRef = {
  elementRef: { current: SVGElement };
};

export type HostDetector = RefObject<Element | null>;

export const NativeGestureRole = {
  Button: 'GestureHandlerButton',
  Switch: 'Switch',
  ScrollView: 'ScrollView',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type NativeGestureRole =
  (typeof NativeGestureRole)[keyof typeof NativeGestureRole];
