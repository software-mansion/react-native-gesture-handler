import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type ManualGestureHandlerProps = {};

type ManualHandlerData = {};

type ManualGestureInternalConfig = BaseGestureConfig<
  ManualHandlerData,
  ManualGestureHandlerProps
>;

export type ManualGestureConfig =
  ExcludeInternalConfigProps<ManualGestureInternalConfig>;

export function useManual(config: ManualGestureConfig) {
  const manualConfig = cloneConfig<
    ManualHandlerData,
    ManualGestureHandlerProps
  >(config);

  return useGesture(SingleGestureName.Manual, manualConfig);
}
