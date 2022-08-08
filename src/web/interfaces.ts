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

export interface Config extends Record<string, any> {
  enabled?: boolean;
  simultaneousHandlers?: any[] | null;
  waitFor?: [] | null;
  hitSlop?: HitSlop;
}

interface NativeEvent extends Record<string, any> {
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

export interface GestureMethods {
  onGestureHandlerEvent: () => void;
  onGestureHandlerStateChange: () => void;
}

export interface PropsRef {
  //   current: GestureMethods;
  onGestureHandlerEvent: () => void;
  onGestureHandlerStateChange: () => void;
}
