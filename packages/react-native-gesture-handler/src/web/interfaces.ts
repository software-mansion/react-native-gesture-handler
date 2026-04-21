import type { Directions } from '../Directions';
import type {
  ActiveCursor,
  GestureTouchEvent,
  MouseButton,
  StylusData,
  TouchAction,
  UserSelect,
} from '../handlers/gestureHandlerCommon';
import type { PointerType } from '../PointerType';
import type { State } from '../State';
import type {
  GestureStateChangeEventWithHandlerData,
  GestureUpdateEventWithHandlerData,
} from '../v3/types';

export interface HitSlop {
  left?: number | undefined;
  right?: number | undefined;
  top?: number | undefined;
  bottom?: number | undefined;
  horizontal?: number | undefined;
  vertical?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

export interface Handler {
  handlerTag: number;
}

type ConfigArgs =
  | number
  | boolean
  | string
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
  simultaneousHandlers?: Handler[] | null | undefined;
  waitFor?: Handler[] | null | undefined;
  blocksHandlers?: Handler[] | null | undefined;
  hitSlop?: HitSlop | undefined;
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
