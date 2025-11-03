import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';
import { NativeGestureNativeProperties } from '../hooks/gestures/native/NativeProperties';

export type NativeWrapperProperties = CommonGestureConfig &
  GestureCallbacks<unknown> &
  NativeGestureNativeProperties &
  ExternalRelations;
