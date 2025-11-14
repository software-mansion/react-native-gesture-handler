import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import { NativeGestureNativeProperties } from './NativeProperties';

type NativeViewHandlerData = {
  pointerInside: boolean;
};

type NativeViewGestureProperties =
  WithSharedValue<NativeGestureNativeProperties>;

type NativeViewGestureInternalConfig = BaseDiscreteGestureConfig<
  NativeViewHandlerData,
  NativeViewGestureProperties
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureInternalConfig>;

export type NativeGestureStateChangeEvent =
  GestureStateChangeEvent<NativeViewHandlerData>;

export type NativeGestureUpdateEvent =
  GestureUpdateEvent<NativeViewHandlerData>;

export type NativeGesture = SingleGesture<
  NativeViewHandlerData,
  NativeViewGestureProperties
>;

export function useNative(config: NativeViewGestureConfig): NativeGesture {
  const nativeConfig = useClonedAndRemappedConfig<
    NativeViewHandlerData,
    NativeViewGestureProperties,
    NativeViewGestureProperties
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
