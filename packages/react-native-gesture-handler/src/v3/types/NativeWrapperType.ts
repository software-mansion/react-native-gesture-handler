import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';
import { NativeGestureNativeProperties } from '../hooks/gestures/native/NativeProperties';
import { NativeViewHandlerData } from '../hooks/gestures/native/useNativeGesture';

export type NativeWrapperProperties = CommonGestureConfig &
  GestureCallbacks<NativeViewHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations;
