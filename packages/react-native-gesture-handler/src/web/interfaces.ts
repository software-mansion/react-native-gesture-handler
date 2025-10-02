import {
  UserSelect,
  ActiveCursor,
  MouseButton,
  TouchAction,
  StylusData,
  GestureTouchEvent,
} from '../handlers/gestureHandlerCommon';
import { Directions } from '../Directions';
import { PointerType } from '../PointerType';
import { GestureStateChangeEvent, GestureUpdateEvent } from '../v3/types';
import { State } from '../State';

export interface HitSlop {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  horizontal?: number;
  vertical?: number;
  width?: number;
  height?: number;
}

export interface Handler {
  handlerTag: number;
}

type ConfigArgs =
  | number
  | boolean
  | HitSlop
  | UserSelect
  | TouchAction
  | ActiveCursor
  | Directions
  | Handler[]
  | null
  | undefined;

export interface Config extends Record<string, ConfigArgs> {
  enabled: boolean;
  simultaneousHandlers?: Handler[] | null;
  waitFor?: Handler[] | null;
  blocksHandlers?: Handler[] | null;
  hitSlop?: HitSlop;
  shouldCancelWhenOutside?: boolean;
  userSelect?: UserSelect;
  activeCursor?: ActiveCursor;
  mouseButton?: MouseButton;
  enableContextMenu?: boolean;
  touchAction?: TouchAction;
  manualActivation?: boolean;
  dispatchesAnimatedEvents?: false;
  shouldUseReanimated?: boolean;
  needsPointerData?: false;

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
  direction?: Directions;
  enableTrackpadTwoFingerGesture?: boolean;
}

type NativeEventArgs = number | State | boolean | undefined;
export interface GestureHandlerNativeEvent
  extends Record<string, NativeEventArgs> {
  numberOfPointers: number;
  state: State;
  handlerTag: number;
  oldState?: State;
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
  | GestureUpdateEvent<unknown>
  | GestureStateChangeEvent<unknown>
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
  button?: MouseButton;
  stylusData?: StylusData;
  wheelDeltaY?: number;
}

export enum EventTypes {
  DOWN,
  ADDITIONAL_POINTER_DOWN,
  UP,
  ADDITIONAL_POINTER_UP,
  MOVE,
  ENTER,
  LEAVE,
  CANCEL,
}

export enum WheelDevice {
  UNDETERMINED,
  MOUSE,
  TOUCHPAD,
}

export type GestureHandlerRef = {
  viewTag: GestureHandlerRef;
  current: HTMLElement;
};

export type SVGRef = {
  elementRef: { current: SVGElement };
};

export enum GestureHandlerName {
  Tap = 'TapGestureHandler',
  Pan = 'PanGestureHandler',
  LongPress = 'LongPressGestureHandler',
  Pinch = 'PinchGestureHandler',
  Rotation = 'RotationGestureHandler',
  Fling = 'FlingGestureHandler',
  NativeView = 'NativeViewGestureHandler',
  ForceTouch = 'ForceTouchGestureHandler',
  Manual = 'ManualGestureHandler',
  Hover = 'HoverGestureHandler',
}
