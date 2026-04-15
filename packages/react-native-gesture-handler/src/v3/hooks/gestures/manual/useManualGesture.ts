import type {
  ManualGesture,
  ManualGestureConfig,
  ManualGestureProperties,
  ManualHandlerData,
} from './ManualTypes';
import { SingleGestureName } from '../../../types';
import { useClonedAndRemappedConfig } from '../../utils';
import { useGesture } from '../../useGesture';

export function useManualGesture(config: ManualGestureConfig): ManualGesture {
  const manualConfig = useClonedAndRemappedConfig<
    ManualGestureProperties,
    ManualHandlerData
  >(config);

  return useGesture(SingleGestureName.Manual, manualConfig);
}
