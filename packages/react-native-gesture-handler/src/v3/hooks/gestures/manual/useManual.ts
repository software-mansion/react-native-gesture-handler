import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { cloneConfig } from '../../utils';
import { ManualGestureNativeProperties } from './ManualProperties';

type ManualHandlerData = Record<string, never>;

type ManualGestureProperties = ManualGestureNativeProperties;

type ManualGestureInternalConfig = BaseGestureConfig<
  ManualHandlerData,
  ManualGestureProperties
>;
export type ManualGestureConfig =
  ExcludeInternalConfigProps<ManualGestureInternalConfig>;

export function useManual(config: ManualGestureConfig) {
  const manualConfig = cloneConfig<ManualHandlerData, ManualGestureProperties>(
    config
  );

  return useGesture(SingleGestureName.Manual, manualConfig);
}
