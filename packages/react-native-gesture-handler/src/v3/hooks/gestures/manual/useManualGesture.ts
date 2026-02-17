import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import {
  ManualGestureProperties,
  ManualHandlerData,
  ManualGesture,
  ManualGestureConfig,
} from './ManualTypes';

export function useManualGesture(config: ManualGestureConfig): ManualGesture {
  const manualConfig = useClonedAndRemappedConfig<
    ManualGestureProperties,
    ManualHandlerData
  >(config);

  return useGesture(SingleGestureName.Manual, manualConfig);
}
