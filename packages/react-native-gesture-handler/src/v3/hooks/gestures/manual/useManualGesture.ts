import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  GestureEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import { ManualGestureNativeProperties } from './ManualProperties';

type ManualHandlerData = Record<string, never>;

type ManualGestureProperties = ManualGestureNativeProperties;

type ManualGestureInternalConfig = BaseGestureConfig<
  ManualHandlerData,
  ManualHandlerData,
  ManualGestureProperties
>;

export type ManualGestureConfig =
  ExcludeInternalConfigProps<ManualGestureInternalConfig>;

export type ManualGestureEvent = GestureEvent<ManualHandlerData>;

export type ManualGesture = SingleGesture<
  ManualHandlerData,
  ManualHandlerData,
  ManualGestureProperties
>;

export function useManualGesture(config: ManualGestureConfig): ManualGesture {
  const manualConfig = useClonedAndRemappedConfig<
    ManualHandlerData,
    ManualHandlerData,
    ManualGestureProperties,
    ManualGestureProperties
  >(config);

  return useGesture(SingleGestureName.Manual, manualConfig);
}
