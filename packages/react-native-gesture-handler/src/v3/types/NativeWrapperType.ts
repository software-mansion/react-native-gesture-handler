import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';
import { NativeGestureNativeProperties } from '../hooks/gestures/native/NativeTypes';
import { NativeViewHandlerData } from '../hooks/gestures/native/useNativeGesture';

export type NativeWrapperProperties = CommonGestureConfig &
  GestureCallbacks<NativeViewHandlerData, NativeViewHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations;
