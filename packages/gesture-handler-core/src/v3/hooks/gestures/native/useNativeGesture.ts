import type { CoreRuntime } from '../../../platform/Port';
import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  NativeGesture,
  NativeGestureConfig,
  NativeGestureProperties,
  NativeHandlerData,
} from './NativeTypes';

const EMPTY_NATIVE_CONFIG: NativeGestureConfig = {};

export function useNativeGesture(
  runtime: CoreRuntime,
  config: NativeGestureConfig = EMPTY_NATIVE_CONFIG
): NativeGesture {
  const nativeConfig = useClonedAndRemappedConfig<
    NativeGestureProperties,
    NativeHandlerData
  >(runtime, config);

  return useGesture(runtime, SingleGestureName.Native, nativeConfig);
}
