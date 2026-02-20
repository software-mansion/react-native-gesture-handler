import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';

import {
  NativeGestureNativeProperties,
  NativeHandlerData,
  NativeGesture,
} from '../hooks/gestures/native/NativeTypes';

export type WrapperSpecificProperties<T = unknown> = {
  ref?: React.RefObject<T>;
  onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
    gesture: NativeGesture
  ) => void;
};

export type NativeWrapperProperties<T = unknown> = CommonGestureConfig &
  GestureCallbacks<NativeHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations &
  WrapperSpecificProperties<T>;
