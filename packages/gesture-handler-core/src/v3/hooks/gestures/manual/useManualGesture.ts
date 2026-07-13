import type { CoreRuntime } from '../../../platform/Port';
import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  ManualGesture,
  ManualGestureConfig,
  ManualGestureProperties,
  ManualHandlerData,
} from './ManualTypes';

const EMPTY_MANUAL_CONFIG: ManualGestureConfig = {};

export function useManualGesture(
  runtime: CoreRuntime,
  config: ManualGestureConfig = EMPTY_MANUAL_CONFIG
): ManualGesture {
  const manualConfig = useClonedAndRemappedConfig<
    ManualGestureProperties,
    ManualHandlerData
  >(runtime, config);

  return useGesture(runtime, SingleGestureName.Manual, manualConfig);
}
