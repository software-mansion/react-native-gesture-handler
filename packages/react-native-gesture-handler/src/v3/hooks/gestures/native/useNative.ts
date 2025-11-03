import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { cloneConfig } from '../../utils';
import { NativeGestureNativeProperties } from './NativeProperties';

export type NativeViewHandlerData = {
  pointerInside: boolean;
};

type NativeViewGestureProperties =
  WithSharedValue<NativeGestureNativeProperties>;

type NativeViewGestureInternalConfig = BaseGestureConfig<
  NativeViewHandlerData,
  NativeViewGestureProperties
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureInternalConfig>;

export function useNative(config: NativeViewGestureConfig) {
  const nativeConfig = cloneConfig<
    NativeViewHandlerData,
    NativeViewGestureProperties
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}

export type NativeGestureStateChangeEvent =
  GestureStateChangeEvent<NativeViewHandlerData>;
export type NativeGestureUpdateEvent =
  GestureUpdateEvent<NativeViewHandlerData>;

export type NativeGesture = SingleGesture<
  NativeViewHandlerData,
  NativeViewGestureProperties
>;
