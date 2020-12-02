// @ts-nocheck
interface GestureHandlerPropTypes {
  id: string;
  minPointers: number;
  enabled: boolean;
  waitFor: string | object | Array<string> | Array<object>;
  simultaneousHandlers: string | object | Array<string> | Array<object>;
  shouldCancelWhenOutside: boolean;
  hitSlop:
    | number
    | {
        left: number;
        top: number;
        right: number;
        bottom: number;
        vertical: number;
        horizontal: number;
        width: number;
        height: number;
      };
  onGestureEvent: (payload: unknown) => void | object;
  onHandlerStateChange: (payload: unknown) => void | object;
  onBegan: (payload: unknown) => void;
  onFailed: (payload: unknown) => void;
  onCancelled: (payload: unknown) => void;
  onActivated: (payload: unknown) => void;
  onEnded: (payload: unknown) => void;
}

const GestureHandlerPropObject: GestureHandlerPropTypes = {};

export default GestureHandlerPropObject;
