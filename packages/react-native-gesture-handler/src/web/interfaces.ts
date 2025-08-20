import {
  UserSelect,
  ActiveCursor,
  MouseButton,
  TouchAction,
} from '../handlers/gestureHandlerCommon';
import { Directions } from '../Directions';
import { State } from '../State';
import { PointerType } from '../PointerType';

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
interface NativeEvent extends Record<string, NativeEventArgs> {
  numberOfPointers: number;
  state: State;
  pointerInside: boolean | undefined;
  handlerTag: number;
  target: number;
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

type TouchNativeArgs = number | State | TouchEventType | PointerData[];

interface NativeTouchEvent extends Record<string, TouchNativeArgs> {
  handlerTag: number;
  state: State;
  eventType: TouchEventType;
  changedTouches: PointerData[];
  allTouches: PointerData[];
  numberOfTouches: number;
  pointerType: PointerType;
}

export interface ResultEvent extends Record<string, NativeEvent | number> {
  nativeEvent: NativeEvent;
  timeStamp: number;
}

export interface ResultTouchEvent
  extends Record<string, NativeTouchEvent | number> {
  nativeEvent: NativeTouchEvent;
  timeStamp: number;
}

export interface PropsRef {
  onGestureHandlerEvent: (e: any) => void;
  onGestureHandlerAnimatedEvent?: (e: any) => void;
  onGestureHandlerStateChange: (e: any) => void;
  onGestureHandlerTouchEvent?: (e: any) => void;
}

export interface StylusData {
  tiltX: number;
  tiltY: number;
  azimuthAngle: number;
  altitudeAngle: number;
  pressure: number;
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

export enum TouchEventType {
  UNDETERMINED,
  DOWN,
  MOVE,
  UP,
  CANCELLED,
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
