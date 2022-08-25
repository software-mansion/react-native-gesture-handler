import { Directions } from '../Directions';
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
  | Directions
  | Handler[]
  | null
  | undefined;

export interface Config extends Record<string, ConfigArgs> {
  enabled?: boolean;
  simultaneousHandlers?: Handler[] | null;
  waitFor?: Handler[] | null;
  hitSlop?: HitSlop;

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
  failOffsetXStart?: number;
  failOffsetYStart?: number;
  failOffsetXEnd?: number;
  failOffsetYEnd?: number;
  activeOffsetXStart?: number;
  activeOffsetXEnd?: number;
  activeOffsetYStart?: number;
  activeOffsetYEnd?: number;
  numberOfPointers?: number;
  minDurationMs?: number;
  numberOfTaps?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  direction?: Directions;
}

type NativeEventArgs = number | State | boolean | undefined;
interface NativeEvent extends Record<string, NativeEventArgs> {
  numberOfPointers: number;
  state: State;
  pointerInside: boolean | undefined;
  handlerTag: number;
  target: number;
  oldState?: State;
}

export interface ResultEvent extends Record<string, NativeEvent | number> {
  nativeEvent: NativeEvent;
  timeStamp: number;
}

export interface PropsRef {
  onGestureHandlerEvent: () => void;
  onGestureHandlerStateChange: () => void;
}

export interface AdaptedPointerEvent {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  eventType: EventTypes;
  pointerType: string;
  buttons: number;
  time: number;
}

export enum MouseButtons {
  NONE,
  LEFT,
  RIGHT,
  LEFT_RIGHT,
  SCROLL,
  SCROLL_LEFT,
  SCROLL_RIGHT,
  SCROLL_LEFT_RIGHT,
}

export enum EventTypes {
  DOWN,
  ADDITIONAL_POINTER_DOWN,
  UP,
  ADDITIONAL_POINTER_UP,
  MOVE,
  ENTER,
  OUT,
  CANCEL,
}
