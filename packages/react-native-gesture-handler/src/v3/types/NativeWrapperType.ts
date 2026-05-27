import type {
  NativeGesture,
  NativeGestureNativeProperties,
  NativeHandlerData,
} from '../hooks/gestures/native/NativeTypes';
import type {
  CommonGestureConfig,
  ExternalRelations,
  GestureCallbacks,
} from '.';

export type WrapperSpecificProperties<T = unknown> = {
  ref?: React.Ref<T> | undefined;
  onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
    gesture: NativeGesture
  ) => void;
};

export type NativeWrapperProperties<T = unknown> = CommonGestureConfig &
  GestureCallbacks<NativeHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations &
  WrapperSpecificProperties<T>;
