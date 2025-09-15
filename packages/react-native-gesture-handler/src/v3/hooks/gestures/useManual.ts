import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type ManualGestureProps = {};

type ManualHandlerData = {};

type ManualGestureInternalConfig = BaseGestureConfig<
  ManualHandlerData,
  ManualGestureProps
>;

export type ManualGestureConfig =
  ExcludeInternalConfigProps<ManualGestureInternalConfig>;

export function useManual(config: ManualGestureConfig) {
  const manualConfig = cloneConfig<ManualHandlerData, ManualGestureProps>(
    config
  );

  return useGesture(SingleGestureName.Manual, manualConfig);
}
