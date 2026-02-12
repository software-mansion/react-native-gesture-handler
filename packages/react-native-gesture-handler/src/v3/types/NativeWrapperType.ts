import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';
import { NativeGestureNativeProperties } from '../hooks/gestures/native/NativeProperties';
import {
  NativeGesture,
  NativeViewHandlerData,
} from '../hooks/gestures/native/useNativeGesture';

export type NativeWrapperProperties<T> = CommonGestureConfig &
  GestureCallbacks<NativeViewHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations & {
    ref?: React.RefObject<T>;
    onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
      gesture: NativeGesture
    ) => void;
  };
