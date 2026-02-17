import { CommonGestureConfig, ExternalRelations, GestureCallbacks } from '.';
import {
  NativeGestureNativeProperties,
  NativeHandlerData,
} from '../hooks/gestures/native/NativeTypes';

export type NativeWrapperProperties = CommonGestureConfig &
  GestureCallbacks<NativeHandlerData, NativeHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations;
