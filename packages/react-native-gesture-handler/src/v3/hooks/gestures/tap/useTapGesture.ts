import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  TapGesture,
  TapGestureConfig,
  TapGestureInternalProperties,
  TapGestureProperties,
  TapHandlerData,
} from './TapTypes';

const TapPropsMapping = new Map<
  keyof TapGestureProperties,
  keyof TapGestureInternalProperties
>([
  ['maxDistance', 'maxDist'],
  ['maxDuration', 'maxDurationMs'],
  ['maxDelay', 'maxDelayMs'],
]);

const EMPTY_TAP_CONFIG: TapGestureConfig = {};

export function useTapGesture(
  config: TapGestureConfig = EMPTY_TAP_CONFIG
): TapGesture {
  const tapConfig = useClonedAndRemappedConfig<
    TapGestureProperties,
    TapHandlerData,
    TapGestureInternalProperties
  >(config, TapPropsMapping);

  return useGesture<TapGestureInternalProperties, TapHandlerData>(
    SingleGestureName.Tap,
    tapConfig
  );
}
