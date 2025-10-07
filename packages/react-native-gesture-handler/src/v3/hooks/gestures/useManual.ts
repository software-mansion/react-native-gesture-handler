import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../types';

import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type ManualGestureProperties = Record<string, never>;
type ManualHandlerData = Record<string, never>;

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

export type ManualGestureEvent =
  | GestureStateChangeEvent<ManualHandlerData>
  | GestureUpdateEvent<ManualHandlerData>;

export type ManualGesture = SingleGesture<
  ManualHandlerData,
  ManualGestureProperties
>;
