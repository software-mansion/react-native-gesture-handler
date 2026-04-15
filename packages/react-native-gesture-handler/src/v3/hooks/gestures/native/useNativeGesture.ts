import type {
  NativeGesture,
  NativeGestureConfig,
  NativeGestureProperties,
  NativeHandlerData,
} from './NativeTypes';
import { SingleGestureName } from '../../../types';
import { useClonedAndRemappedConfig } from '../../utils';
import { useGesture } from '../../useGesture';

export function useNativeGesture(config: NativeGestureConfig): NativeGesture {
  const nativeConfig = useClonedAndRemappedConfig<
    NativeGestureProperties,
    NativeHandlerData
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
