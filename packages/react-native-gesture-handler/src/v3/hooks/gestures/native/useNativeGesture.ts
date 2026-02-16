import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import { NativeGestureNativeProperties } from './NativeProperties';

export type NativeViewHandlerData = {
  pointerInside: boolean;
};

type NativeViewGestureProperties =
  WithSharedValue<NativeGestureNativeProperties>;

type NativeViewGestureInternalConfig = BaseDiscreteGestureConfig<
  NativeViewHandlerData,
  NativeViewHandlerData,
  NativeViewGestureProperties
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureInternalConfig>;

export type NativeGestureEvent = GestureEvent<NativeViewHandlerData>;

export type NativeGesture = SingleGesture<
  NativeViewHandlerData,
  NativeViewHandlerData,
  NativeViewGestureProperties
>;

export function useNativeGesture(
  config: NativeViewGestureConfig
): NativeGesture {
  const nativeConfig = useClonedAndRemappedConfig<
    NativeViewHandlerData,
    NativeViewHandlerData,
    NativeViewGestureProperties,
    NativeViewGestureProperties
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
