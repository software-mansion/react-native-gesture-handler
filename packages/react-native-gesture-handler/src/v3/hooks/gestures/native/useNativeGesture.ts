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
  NativeViewGestureProperties,
  NativeViewHandlerData
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureInternalConfig>;

export type NativeGestureEvent = GestureEvent<NativeViewHandlerData>;

export type NativeGesture = SingleGesture<
  NativeViewGestureProperties,
  NativeViewHandlerData
>;

export function useNativeGesture(
  config: NativeViewGestureConfig
): NativeGesture {
  const nativeConfig = useClonedAndRemappedConfig<
    NativeViewGestureProperties,
    NativeViewHandlerData
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
