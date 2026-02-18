import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';
import { NativeGestureNativeProperties } from '../hooks/gestures/native/NativeProperties';
import {
  NativeGesture,
  NativeViewHandlerData,
} from '../hooks/gestures/native/useNativeGesture';

export type WrapperSpecificProperties<T = unknown> = {
  ref?: React.RefObject<T>;
  onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
    gesture: NativeGesture
  ) => void;
};

export type NativeWrapperProperties<T = unknown> = CommonGestureConfig &
  GestureCallbacks<NativeViewHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations &
  WrapperSpecificProperties<T>;
