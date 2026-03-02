import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import {
  NativeGesture,
  NativeGestureConfig,
  NativeGestureProperties,
  NativeHandlerData,
} from './NativeTypes';

export function useNativeGesture(config: NativeGestureConfig): NativeGesture {
  const nativeConfig = useClonedAndRemappedConfig<
    NativeGestureProperties,
    NativeHandlerData
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
