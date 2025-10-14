import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  GestureStateChangeEvent,
  GestureUpdateEvent,
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

export type ManualGestureStateChangeEvent =
  GestureStateChangeEvent<ManualHandlerData>;
export type ManualGestureUpdateEvent = GestureUpdateEvent<ManualHandlerData>;

export type ManualGesture = SingleGesture<
  ManualHandlerData,
  ManualGestureProperties
>;
