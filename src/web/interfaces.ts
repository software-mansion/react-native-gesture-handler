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
  simultaneousHandlers?: [] | null;
  waitFor?: any[] | null;
  hitSlop?: HitSlop;

  //
  minPointers?: number;
  maxPointers?: number;
  minDist?: number;
  minDistSq?: number;
  minVelocity?: number;
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
